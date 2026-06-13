import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Adminlogin } from './adminlogin';
import { adminloginService } from './adminloginservice';
import { FormsModule } from '@angular/forms';

describe('Adminlogin', () => {
  let component: Adminlogin;
  let fixture: ComponentFixture<Adminlogin>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAdminService: jasmine.SpyObj<adminloginService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAdminService = jasmine.createSpyObj('adminloginService', ['isLoggedIn', 'adminLogin', 'logout']);

    mockAdminService.isLoggedIn.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [Adminlogin, FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: adminloginService, useValue: mockAdminService }
      ]
    }).compileComponents();

    localStorage.clear();
    fixture = TestBed.createComponent(Adminlogin);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should redirect to admin homepage if admin is logged in', () => {
      mockAdminService.isLoggedIn.and.returnValue(true);
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/admin-homepage']);
    });

    it('should redirect to home if regular user is logged in', () => {
      mockAdminService.isLoggedIn.and.returnValue(false);
      localStorage.setItem('loginStatus', 'true');
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not redirect if nobody is logged in', () => {
      mockAdminService.isLoggedIn.and.returnValue(false);
      component.ngOnInit();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle showPassword', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeTrue();
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeFalse();
    });
  });

  describe('userloginSummit', () => {
    it('should log error when both fields are empty', () => {
      spyOn(console, 'log');
      component.adminuser.email = '';
      component.adminuser.password = '';
      component.userloginSummit();
      expect(console.log).toHaveBeenCalledWith('enter username and password');
    });

    it('should log error when email is empty', () => {
      spyOn(console, 'log');
      component.adminuser.email = '';
      component.adminuser.password = 'test';
      component.userloginSummit();
      expect(console.log).toHaveBeenCalledWith('enter username');
    });

    it('should log error when password is empty', () => {
      spyOn(console, 'log');
      component.adminuser.email = 'admin@gmail.com';
      component.adminuser.password = '';
      component.userloginSummit();
      expect(console.log).toHaveBeenCalledWith('enter password');
    });

    it('should call checkadmin when both fields are filled', () => {
      spyOn(component, 'checkadmin');
      component.adminuser.email = 'admin@gmail.com';
      component.adminuser.password = 'Admin123!';
      component.userloginSummit();
      expect(component.showloading).toBeTrue();
      expect(component.checkadmin).toHaveBeenCalledWith('admin@gmail.com', 'Admin123!');
    });
  });

  describe('checkadmin', () => {
    it('should navigate to admin homepage for admin role', () => {
      mockAdminService.adminLogin.and.returnValue(of({ userId: 1, role: 'Admin' }));
      component.checkadmin('admin@gmail.com', 'Admin123!');
      expect(localStorage.getItem('isAdminLoggedIn')).toBe('true');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/admin-homepage']);
    });

    it('should navigate to home for non-admin role', () => {
      mockAdminService.adminLogin.and.returnValue(of({ userId: 2, role: 'User' }));
      spyOn(window, 'alert');
      component.checkadmin('user@gmail.com', 'User123!');
      expect(localStorage.getItem('loginStatus')).toBe('true');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      expect(window.alert).toHaveBeenCalled();
    });

    it('should alert on error', () => {
      spyOn(window, 'alert');
      mockAdminService.adminLogin.and.returnValue(throwError(() => ({ error: 'Invalid credentials' })));
      component.checkadmin('admin@gmail.com', 'wrong');
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
      expect(component.showloading).toBeFalse();
    });
  });
});
