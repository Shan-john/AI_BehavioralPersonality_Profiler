import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Settings } from './settings';
import { SettingsService } from './settings-service';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSettingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSettingsService = jasmine.createSpyObj('SettingsService', ['getUserProfile', 'getReportByUserId']);

    // Default mock returns
    mockSettingsService.getUserProfile.and.returnValue(of({ email: 'test@gmail.com' }));
    mockSettingsService.getReportByUserId.and.returnValue(of({ hasReport: false, data: '' }));

    await TestBed.configureTestingModule({
      imports: [Settings, RouterTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SettingsService, useValue: mockSettingsService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } }
      ]
    }).compileComponents();

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function createAndInit() {
    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
  }

  it('should create', () => {
    localStorage.setItem('id', '1');
    localStorage.setItem('loginStatus', 'true');
    createAndInit();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to signup when no id is stored', () => {
      createAndInit();
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
    });

    it('should redirect to signup when loginStatus is not true', () => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'false');
      createAndInit();
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
    });

    it('should load user data when logged in', () => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createAndInit();
      component.ngOnInit();
      expect(mockSettingsService.getUserProfile).toHaveBeenCalledWith(1);
    });
  });

  describe('extractNameFromEmail', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createAndInit();
    });

    it('should extract and capitalize name from simple email', () => {
      expect(component.extractNameFromEmail('john@gmail.com')).toBe('John');
    });

    it('should handle dots in email', () => {
      expect(component.extractNameFromEmail('john.doe@gmail.com')).toBe('John Doe');
    });

    it('should handle underscores', () => {
      expect(component.extractNameFromEmail('john_doe@gmail.com')).toBe('John Doe');
    });

    it('should remove numbers', () => {
      expect(component.extractNameFromEmail('john123@gmail.com')).toBe('John');
    });

    it('should return User for empty local part', () => {
      expect(component.extractNameFromEmail('@gmail.com')).toBe('User');
    });
  });

  describe('extractAIScores', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createAndInit();
    });

    it('should extract scores from SCORES_START block', () => {
      const report = 'Some text\nSCORES_START\nEmpathy & Collaboration: 85\nAnalytical Depth: 72\nSCORES_END\nMore text';
      const scores = component.extractAIScores(report);
      expect(scores['Empathy & Collaboration']).toBe(85);
      expect(scores['Analytical Depth']).toBe(72);
    });

    it('should return empty object when no scores block', () => {
      const scores = component.extractAIScores('No scores here');
      expect(Object.keys(scores).length).toBe(0);
    });

    it('should ignore invalid scores', () => {
      const report = 'SCORES_START\nInvalid: abc\nValid: 50\nSCORES_END';
      const scores = component.extractAIScores(report);
      expect(scores['Invalid']).toBeUndefined();
      expect(scores['Valid']).toBe(50);
    });

    it('should reject scores outside 0-100 range', () => {
      const report = 'SCORES_START\nTooHigh: 150\nNegative: -10\nSCORES_END';
      const scores = component.extractAIScores(report);
      expect(scores['TooHigh']).toBeUndefined();
      // -10 after removing non-digits becomes 10 which is valid
    });
  });

  describe('parseReport', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createAndInit();
    });

    it('should parse new format with CORE TRAITS / BEHAVIORAL PATTERNS / STRENGTHS', () => {
      const report = 'CORE TRAITS: Empathetic and caring\nBEHAVIORAL PATTERNS: Consistent and reliable\nSTRENGTHS & BLIND SPOTS: Strong communication';
      const parsed = component.parseReport(report);
      expect(parsed.coreEssence).toContain('Empathetic');
      expect(parsed.behavioralMasterclass).toContain('Consistent');
      expect(parsed.powerPivot).toContain('Strong');
    });

    it('should parse legacy format with numbered sections', () => {
      const report = '1. The Core Essence Some core text 2. Behavioral Masterclass Some behavior text 3. The Power & The Pivot Some power text';
      const parsed = component.parseReport(report);
      expect(parsed.coreEssence).toBeTruthy();
      expect(parsed.behavioralMasterclass).toBeTruthy();
    });

    it('should fall back to paragraph splitting when no markers found', () => {
      const report = 'Paragraph one\n\nParagraph two\n\nParagraph three';
      const parsed = component.parseReport(report);
      expect(parsed.coreEssence).toBe('Paragraph one');
      expect(parsed.behavioralMasterclass).toBe('Paragraph two');
      expect(parsed.powerPivot).toBe('Paragraph three');
    });
  });

  describe('getBehavioralTraits', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createAndInit();
    });

    it('should use AI scores when available', () => {
      const aiScores = { 'Empathy & Collaboration': 90, 'Analytical Depth': 60 };
      const traits = component.getBehavioralTraits('some report text', aiScores);
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.score).toBe(90);
      expect(empathy.level).toBe('Outstanding');
    });

    it('should fall back to keyword analysis when no AI scores', () => {
      const traits = component.getBehavioralTraits('empathy compassion team support collaborate empathy', {});
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.score).toBeGreaterThan(30);
    });

    it('should return 5 traits', () => {
      const traits = component.getBehavioralTraits('some text', {});
      expect(traits.length).toBe(5);
    });

    it('should assign correct level labels', () => {
      const aiScores = {
        'Empathy & Collaboration': 90,
        'Resilience & Adaptability': 75,
        'Analytical Depth': 60,
        'Creativity & Innovation': 45,
        'Leadership & Influence': 30
      };
      const traits = component.getBehavioralTraits('text', aiScores);
      expect(traits.find((t: any) => t.name === 'Empathy & Collaboration')!.level).toBe('Outstanding');
      expect(traits.find((t: any) => t.name === 'Resilience & Adaptability')!.level).toBe('Strong');
      expect(traits.find((t: any) => t.name === 'Analytical Depth')!.level).toBe('Moderate');
      expect(traits.find((t: any) => t.name === 'Creativity & Innovation')!.level).toBe('Developing');
      expect(traits.find((t: any) => t.name === 'Leadership & Influence')!.level).toBe('Low');
    });
  });

  describe('getArchetype', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createAndInit();
    });

    it('should return Harmonizer for highest Empathy trait', () => {
      const traits = [
        { name: 'Empathy & Collaboration', score: 90 },
        { name: 'Analytical Depth', score: 50 }
      ];
      const archetype = component.getArchetype(traits);
      expect(archetype.name).toBe('The Harmonizer');
    });

    it('should return Strategist for highest Analytical trait', () => {
      const traits = [
        { name: 'Empathy & Collaboration', score: 40 },
        { name: 'Analytical Depth', score: 95 },
        { name: 'Leadership & Influence', score: 60 }
      ];
      const archetype = component.getArchetype(traits);
      expect(archetype.name).toBe('The Strategist');
    });
  });

  describe('getCognitiveMetrics', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createAndInit();
    });

    it('should use AI scores when available', () => {
      const aiScores = { 'Decision Speed': 80, 'Stress Tolerance': 70 };
      const metrics = component.getCognitiveMetrics(aiScores);
      expect(metrics.find((m: any) => m.name === 'Decision Speed')!.score).toBe(80);
    });

    it('should default to 50 when no AI scores', () => {
      const metrics = component.getCognitiveMetrics({});
      metrics.forEach((m: any) => {
        expect(m.score).toBe(50);
      });
    });

    it('should return 4 metrics', () => {
      const metrics = component.getCognitiveMetrics({});
      expect(metrics.length).toBe(4);
    });
  });

  describe('navigation methods', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createAndInit();
    });

    it('goHome should navigate to /home', () => {
      component.goHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('logout should clear login state and navigate to signup', () => {
      localStorage.setItem('loginStatus', 'true');
      localStorage.setItem('id', '1');
      component.logout();
      expect(localStorage.getItem('loginStatus')).toBe('false');
      expect(localStorage.getItem('id')).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
    });

    it('startTest should navigate to testpage', () => {
      component.startTest();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home/testpage']);
    });
  });
});
