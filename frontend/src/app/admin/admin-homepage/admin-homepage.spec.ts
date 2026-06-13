import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AdminHomepage } from './admin-homepage';
import { AdminHomepageService } from './admin-homepageService';
import { adminloginService } from '../adminlogin/adminloginservice';

describe('AdminHomepage', () => {
  let component: AdminHomepage;
  let fixture: ComponentFixture<AdminHomepage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAdminHomepageService: jasmine.SpyObj<AdminHomepageService>;
  let mockAdminLoginService: jasmine.SpyObj<adminloginService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAdminHomepageService = jasmine.createSpyObj('AdminHomepageService', ['getAllUsers', 'getReportByUserId']);
    mockAdminLoginService = jasmine.createSpyObj('adminloginService', ['isLoggedIn', 'logout']);

    mockAdminLoginService.isLoggedIn.and.returnValue(true);
    // Return empty array so ngOnInit doesn't try to call getReportByUserId
    mockAdminHomepageService.getAllUsers.and.returnValue(of([]));
    // Ensure getReportByUserId always returns a proper Observable (for .pipe())
    mockAdminHomepageService.getReportByUserId.and.returnValue(
      of({ hasReport: false, data: null, userId: 0 })
    );

    await TestBed.configureTestingModule({
      imports: [AdminHomepage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AdminHomepageService, useValue: mockAdminHomepageService },
        { provide: adminloginService, useValue: mockAdminLoginService }
      ]
    }).compileComponents();

    localStorage.clear();
    fixture = TestBed.createComponent(AdminHomepage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to admin login when not logged in', () => {
      mockAdminLoginService.isLoggedIn.and.returnValue(false);
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/adminlogin']);
    });

    it('should fetch all users when logged in', () => {
      const users = [
        { id: 1, email: 'user1@gmail.com' },
        { id: 2, email: 'admin@gmail.com' }
      ];
      mockAdminHomepageService.getAllUsers.and.returnValue(of(users));
      component.ngOnInit();
      // admin@gmail.com should be filtered out
      expect(component.users().length).toBe(1);
      expect(component.users()[0].email).toBe('user1@gmail.com');
    });

    it('should fetch reports for all non-admin users', () => {
      const users = [
        { id: 1, email: 'user1@gmail.com' },
        { id: 3, email: 'user2@gmail.com' }
      ];
      mockAdminHomepageService.getAllUsers.and.returnValue(of(users));
      mockAdminHomepageService.getReportByUserId.and.returnValue(
        of({ hasReport: true, data: 'report data', userId: 1 })
      );
      component.ngOnInit();
      expect(mockAdminHomepageService.getReportByUserId).toHaveBeenCalled();
    });
  });

  describe('computed signals', () => {
    it('totalUsers should reflect users signal length', () => {
      component.users.set([
        { email: 'a@gmail.com', password: '', id: 1 },
        { email: 'b@gmail.com', password: '', id: 2 }
      ]);
      expect(component.totalUsers()).toBe(2);
    });

    it('analyzedUsersCount should count users with valid reports', () => {
      component.users.set([
        { email: 'a@gmail.com', password: '', id: 1 },
        { email: 'b@gmail.com', password: '', id: 2 }
      ]);
      component.userReports.set({ 1: 'Valid report data' });
      expect(component.analyzedUsersCount()).toBe(1);
    });

    it('pendingUsersCount should be total minus analyzed', () => {
      component.users.set([
        { email: 'a@gmail.com', password: '', id: 1 },
        { email: 'b@gmail.com', password: '', id: 2 },
        { email: 'c@gmail.com', password: '', id: 3 }
      ]);
      component.userReports.set({ 1: 'Report 1' });
      expect(component.pendingUsersCount()).toBe(2);
    });
  });

  describe('hasReport', () => {
    it('should return false for undefined', () => {
      expect(component.hasReport(undefined)).toBeFalse();
    });

    it('should return false for empty string', () => {
      expect(component.hasReport('')).toBeFalse();
    });

    it('should return false for "null"', () => {
      expect(component.hasReport('null')).toBeFalse();
    });

    it('should return false for "undefined"', () => {
      expect(component.hasReport('undefined')).toBeFalse();
    });

    it('should return false for "No report submitted"', () => {
      expect(component.hasReport('No report submitted')).toBeFalse();
    });

    it('should return false for whitespace-only string', () => {
      expect(component.hasReport('   ')).toBeFalse();
    });

    it('should return true for valid report text', () => {
      expect(component.hasReport('This is a valid report')).toBeTrue();
    });
  });

  describe('getUserReport', () => {
    it('should return report text for existing user', () => {
      component.userReports.set({ 1: 'Report content' });
      expect(component.getUserReport(1)).toBe('Report content');
    });

    it('should return empty string for non-existing user', () => {
      expect(component.getUserReport(999)).toBe('');
    });
  });

  describe('getArchetype', () => {
    it('should return null when user has no report', () => {
      component.userReports.set({});
      expect(component.getArchetype(1)).toBeNull();
    });

    it('should return archetype based on AI scores', () => {
      const report = 'SCORES_START\nEmpathy & Collaboration: 95\nAnalytical Depth: 40\nSCORES_END\nSome report text';
      component.userReports.set({ 1: report });
      const archetype = component.getArchetype(1);
      expect(archetype).toBeTruthy();
      expect(archetype!.name).toBe('Harmonizer');
    });
  });

  describe('openReport', () => {
    it('should navigate to report page with encoded email', () => {
      component.openReport(1, 'user@gmail.com');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/report', 1, encodeURIComponent('user@gmail.com')]);
    });
  });

  describe('logout', () => {
    it('should clear all auth data and navigate to admin login', () => {
      localStorage.setItem('loginStatus', 'true');
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('id', '1');

      component.logout();

      expect(localStorage.getItem('loginStatus')).toBeNull();
      expect(localStorage.getItem('isAdminLoggedIn')).toBeNull();
      expect(localStorage.getItem('id')).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/adminlogin']);
    });
  });
});
