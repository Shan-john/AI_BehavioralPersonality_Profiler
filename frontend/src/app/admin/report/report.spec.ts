import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Report } from './report';

describe('Report', () => {
  let component: Report;
  let fixture: ComponentFixture<Report>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Report],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'id') return '1';
                  if (key === 'email') return encodeURIComponent('test@gmail.com');
                  return null;
                }
              }
            }
          }
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Report);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // ngOnInit fires an HTTP request - flush it
    const req = httpMock.expectOne(r => r.url.includes('/report/user/1'));
    req.flush({ hasReport: false, data: '' });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('extractAIScores', () => {
    it('should extract scores from SCORES_START block', () => {
      const report = 'SCORES_START\nEmpathy & Collaboration: 85\nAnalytical Depth: 72\nDecision Speed: 60\nSCORES_END';
      const scores = component.extractAIScores(report);
      expect(scores['Empathy & Collaboration']).toBe(85);
      expect(scores['Analytical Depth']).toBe(72);
      expect(scores['Decision Speed']).toBe(60);
    });

    it('should return empty object when no SCORES block exists', () => {
      const scores = component.extractAIScores('Regular report without scores');
      expect(Object.keys(scores).length).toBe(0);
    });

    it('should skip non-numeric score values', () => {
      const report = 'SCORES_START\nInvalid: not_a_number\nValid: 50\nSCORES_END';
      const scores = component.extractAIScores(report);
      expect(scores['Invalid']).toBeUndefined();
      expect(scores['Valid']).toBe(50);
    });

    it('should handle scores at boundary values', () => {
      const report = 'SCORES_START\nLow: 0\nHigh: 100\nSCORES_END';
      const scores = component.extractAIScores(report);
      expect(scores['Low']).toBe(0);
      expect(scores['High']).toBe(100);
    });
  });

  describe('parseReport', () => {
    it('should parse new format with CORE TRAITS / BEHAVIORAL PATTERNS / STRENGTHS', () => {
      const report = 'CORE TRAITS: Very empathetic person\nBEHAVIORAL PATTERNS: Consistent behavior\nSTRENGTHS & BLIND SPOTS: Good communicator';
      const parsed = component.parseReport(report);
      expect(parsed.coreEssence).toContain('empathetic');
      expect(parsed.behavioralMasterclass).toContain('Consistent');
      expect(parsed.powerPivot).toContain('communicator');
    });

    it('should parse legacy format with numbered sections', () => {
      const report = '1. The Core Essence Some core text here 2. Behavioral Masterclass Some behavioral text 3. The Power & The Pivot Some power text';
      const parsed = component.parseReport(report);
      expect(parsed.coreEssence).toBeTruthy();
    });

    it('should fall back to paragraph splitting when no known markers', () => {
      const report = 'First paragraph\n\nSecond paragraph\n\nThird paragraph';
      const parsed = component.parseReport(report);
      expect(parsed.coreEssence).toBe('First paragraph');
      expect(parsed.behavioralMasterclass).toBe('Second paragraph');
      expect(parsed.powerPivot).toBe('Third paragraph');
    });

    it('should handle single paragraph report', () => {
      const report = 'Just a single paragraph of text';
      const parsed = component.parseReport(report);
      expect(parsed.coreEssence).toBeTruthy();
    });
  });

  describe('cleanText', () => {
    it('should trim whitespace', () => {
      expect(component.cleanText('  hello  ')).toBe('hello');
    });

    it('should remove leading colons and dashes', () => {
      expect(component.cleanText(': - some text')).toBe('some text');
    });

    it('should remove leading asterisks and newlines', () => {
      expect(component.cleanText('\n* text')).toBe('text');
    });

    it('should handle empty string', () => {
      expect(component.cleanText('')).toBe('');
    });
  });

  describe('getBehavioralTraits', () => {
    it('should use AI scores when available', () => {
      const aiScores = { 'Empathy & Collaboration': 92 };
      const traits = component.getBehavioralTraits('some text', aiScores);
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.score).toBe(92);
    });

    it('should fall back to keyword analysis when no scores', () => {
      const report = 'empathy compassion care team support collaborate empathy empathy';
      const traits = component.getBehavioralTraits(report, {});
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.score).toBeGreaterThanOrEqual(30);
      expect(empathy.score).toBeLessThanOrEqual(95);
    });

    it('should return exactly 5 traits', () => {
      const traits = component.getBehavioralTraits('text', {});
      expect(traits.length).toBe(5);
    });

    it('should assign Outstanding level for scores >= 85', () => {
      const traits = component.getBehavioralTraits('text', { 'Empathy & Collaboration': 90 });
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.level).toBe('Outstanding');
    });

    it('should assign Strong level for scores 70-84', () => {
      const traits = component.getBehavioralTraits('text', { 'Empathy & Collaboration': 75 });
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.level).toBe('Strong');
    });

    it('should assign Moderate level for scores 55-69', () => {
      const traits = component.getBehavioralTraits('text', { 'Empathy & Collaboration': 60 });
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.level).toBe('Moderate');
    });

    it('should assign Developing level for scores 40-54', () => {
      const traits = component.getBehavioralTraits('text', { 'Empathy & Collaboration': 45 });
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.level).toBe('Developing');
    });

    it('should assign Low level for scores < 40', () => {
      const traits = component.getBehavioralTraits('text', { 'Empathy & Collaboration': 30 });
      const empathy = traits.find((t: any) => t.name === 'Empathy & Collaboration')!;
      expect(empathy.level).toBe('Low');
    });
  });

  describe('getArchetype', () => {
    it('should return Harmonizer for empathy-dominant traits', () => {
      const traits = [
        { name: 'Empathy & Collaboration', score: 95 },
        { name: 'Analytical Depth', score: 40 }
      ];
      const archetype = component.getArchetype(traits);
      expect(archetype.name).toBe('The Harmonizer');
      expect(archetype.emoji).toBe('🤝');
    });

    it('should return Strategist for analytical-dominant traits', () => {
      const traits = [
        { name: 'Empathy & Collaboration', score: 40 },
        { name: 'Analytical Depth', score: 90 }
      ];
      const archetype = component.getArchetype(traits);
      expect(archetype.name).toBe('The Strategist');
    });

    it('should return Commander for leadership-dominant traits', () => {
      const traits = [
        { name: 'Leadership & Influence', score: 95 },
        { name: 'Empathy & Collaboration', score: 50 }
      ];
      const archetype = component.getArchetype(traits);
      expect(archetype.name).toBe('The Commander');
    });

    it('should return Visionary for creativity-dominant traits', () => {
      const traits = [
        { name: 'Creativity & Innovation', score: 88 },
        { name: 'Empathy & Collaboration', score: 40 }
      ];
      const archetype = component.getArchetype(traits);
      expect(archetype.name).toBe('The Visionary');
    });

    it('should return Catalyst for resilience-dominant traits', () => {
      const traits = [
        { name: 'Resilience & Adaptability', score: 92 },
        { name: 'Empathy & Collaboration', score: 40 }
      ];
      const archetype = component.getArchetype(traits);
      expect(archetype.name).toBe('The Catalyst');
    });
  });

  describe('getCognitiveMetrics', () => {
    it('should use AI scores when available', () => {
      const aiScores = {
        'Decision Speed': 85,
        'Stress Tolerance': 70,
        'Focus Depth': 90,
        'Risk Appetite': 55
      };
      const metrics = component.getCognitiveMetrics(aiScores);
      expect(metrics.find((m: any) => m.name === 'Decision Speed')!.score).toBe(85);
      expect(metrics.find((m: any) => m.name === 'Stress Tolerance')!.score).toBe(70);
      expect(metrics.find((m: any) => m.name === 'Focus Depth')!.score).toBe(90);
      expect(metrics.find((m: any) => m.name === 'Risk Appetite')!.score).toBe(55);
    });

    it('should default to 50 when scores not available', () => {
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

  describe('printReport', () => {
    it('should call window.print', () => {
      spyOn(window, 'print');
      component.printReport();
      expect(window.print).toHaveBeenCalled();
    });
  });
});
