import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    localStorage.clear();
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have homename set to parayilhome', () => {
    expect(component.homename).toBe('parayilhome');
  });

  describe('login', () => {
    it('should navigate to signup', () => {
      component.login();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
    });
  });

  describe('logout', () => {
    it('should clear localStorage and navigate to signup', () => {
      localStorage.setItem('loginStatus', 'true');
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('id', '5');

      component.logout();

      expect(localStorage.getItem('loginStatus')).toBeNull();
      expect(localStorage.getItem('isAdminLoggedIn')).toBeNull();
      expect(localStorage.getItem('id')).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
    });
  });

  describe('go_back_dashboard', () => {
    it('should navigate to home', () => {
      component.go_back_dashboard();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('go_to_settings', () => {
    it('should navigate to settings', () => {
      component.go_to_settings();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home/settings']);
    });
  });

  describe('go_to_testpage', () => {
    it('should navigate to testpage when logged in', () => {
      component.logininfo = 'true';
      component.go_to_testpage();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home/testpage']);
    });

    it('should navigate to signup when not logged in', () => {
      component.logininfo = 'false';
      component.go_to_testpage();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
    });

    it('should navigate to signup when logininfo is null', () => {
      component.logininfo = null;
      component.go_to_testpage();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
    });
  });
});
