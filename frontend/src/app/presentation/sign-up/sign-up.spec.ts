import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SignUp } from './sign-up';
import { SignUpService } from './sign-up-service';

describe('SignUp', () => {
  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSignUpService: jasmine.SpyObj<SignUpService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSignUpService = jasmine.createSpyObj('SignUpService', ['userRegister', 'userLogin']);

    await TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SignUpService, useValue: mockSignUpService }
      ]
    }).compileComponents();

    localStorage.clear();
    fixture = TestBed.createComponent(SignUp);
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
      localStorage.setItem('isAdminLoggedIn', 'true');
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/admin-homepage']);
    });

    it('should redirect to home if user is logged in', () => {
      localStorage.setItem('loginStatus', 'true');
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should not redirect if not logged in', () => {
      component.ngOnInit();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('togglePasswordVisibility', () => {
    it('should toggle showPassword from false to true', () => {
      expect(component.showPassword).toBeFalse();
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeTrue();
    });

    it('should toggle showPassword from true to false', () => {
      component.showPassword = true;
      component.togglePasswordVisibility();
      expect(component.showPassword).toBeFalse();
    });
  });

  describe('setlogin / setregister', () => {
    it('setlogin should set indentifylogin to true', () => {
      component.setlogin();
      expect(component.indentifylogin).toBeTrue();
    });

    it('setregister should set indentifylogin to false', () => {
      component.indentifylogin = true;
      component.setregister();
      expect(component.indentifylogin).toBeFalse();
    });
  });

  describe('userloginSummit', () => {
    it('should log error when both email and password are empty', () => {
      spyOn(console, 'log');
      component.user.email = '';
      component.user.password = '';
      component.userloginSummit();
      expect(console.log).toHaveBeenCalledWith('enter username and password');
    });

    it('should log error when email is empty', () => {
      spyOn(console, 'log');
      component.user.email = '';
      component.user.password = 'test123';
      component.userloginSummit();
      expect(console.log).toHaveBeenCalledWith('enter username');
    });

    it('should log error when password is empty', () => {
      spyOn(console, 'log');
      component.user.email = 'test@gmail.com';
      component.user.password = '';
      component.userloginSummit();
      expect(console.log).toHaveBeenCalledWith('enter password');
    });

    it('should call sendregister when both fields are filled', () => {
      spyOn(component, 'sendregister');
      component.user.email = 'test@gmail.com';
      component.user.password = 'Password1!';
      component.userloginSummit();
      expect(component.sendregister).toHaveBeenCalledWith('test@gmail.com', 'Password1!');
    });
  });

  describe('usersignupSummit', () => {
    it('should reject non-gmail emails', () => {
      spyOn(console, 'log');
      component.user.email = 'test@yahoo.com';
      component.user.password = 'Password1!';
      component.usersignupSummit();
      expect(console.log).toHaveBeenCalledWith('Email must end with @gmail.com');
    });

    it('should reject weak passwords', () => {
      spyOn(console, 'log');
      component.user.email = 'test@gmail.com';
      component.user.password = 'weak';
      component.usersignupSummit();
      expect(console.log).toHaveBeenCalledWith(
        'Password must contain 8 characters, uppercase, lowercase, number and special character'
      );
    });

    it('should call userLogin on valid input', () => {
      spyOn(component, 'userLogin');
      component.user.email = 'test@gmail.com';
      component.user.password = 'Password1!';
      component.usersignupSummit();
      expect(component.userLogin).toHaveBeenCalledWith('test@gmail.com', 'Password1!');
    });
  });

  describe('usersummit', () => {
    it('should call userloginSummit when indentifylogin is false', () => {
      spyOn(component, 'userloginSummit');
      component.indentifylogin = false;
      component.usersummit();
      expect(component.userloginSummit).toHaveBeenCalled();
    });

    it('should call usersignupSummit when indentifylogin is true', () => {
      spyOn(component, 'usersignupSummit');
      component.indentifylogin = true;
      component.usersummit();
      expect(component.usersignupSummit).toHaveBeenCalled();
    });
  });

  describe('sendregister', () => {
    it('should navigate to home on successful register for regular user', () => {
      mockSignUpService.userRegister.and.returnValue(of({ userId: 1, role: 'User' }));
      component.sendregister('test@gmail.com', 'Password1!');
      expect(localStorage.getItem('loginStatus')).toBe('true');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to admin homepage for admin role', () => {
      mockSignUpService.userRegister.and.returnValue(of({ userId: 1, role: 'Admin' }));
      component.sendregister('admin@gmail.com', 'Admin123!');
      expect(localStorage.getItem('isAdminLoggedIn')).toBe('true');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/admin-homepage']);
    });

    it('should alert on error', () => {
      spyOn(window, 'alert');
      mockSignUpService.userRegister.and.returnValue(throwError(() => ({ error: 'Registration failed' })));
      component.sendregister('test@gmail.com', 'Password1!');
      expect(window.alert).toHaveBeenCalledWith('Registration failed');
    });
  });

  describe('userLogin', () => {
    it('should navigate to home on successful login for regular user', () => {
      mockSignUpService.userLogin.and.returnValue(of({ userId: 1, role: 'User' }));
      component.userLogin('test@gmail.com', 'Password1!');
      expect(localStorage.getItem('loginStatus')).toBe('true');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should navigate to admin homepage for admin role', () => {
      mockSignUpService.userLogin.and.returnValue(of({ userId: 1, role: 'Admin' }));
      component.userLogin('admin@gmail.com', 'Admin123!');
      expect(localStorage.getItem('isAdminLoggedIn')).toBe('true');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/admin-homepage']);
    });
  });
});
