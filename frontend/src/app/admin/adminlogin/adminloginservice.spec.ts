import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { adminloginService } from './adminloginservice';

describe('adminloginService', () => {
  let service: adminloginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        adminloginService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(adminloginService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('adminLogin', () => {
    it('should send POST request to login URL with credentials', () => {
      const mockResponse = { userId: 1, role: 'Admin' };

      service.adminLogin('admin@gmail.com', 'Admin123!').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r => r.url.includes('/user/login'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'admin@gmail.com', password: 'Admin123!' });
      req.flush(mockResponse);
    });
  });

  describe('adminRegister', () => {
    it('should send POST request to register URL with credentials', () => {
      const mockResponse = { userId: 2, role: 'Admin' };

      service.adminRegister('admin@gmail.com', 'Admin123!').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r => r.url.includes('/user/register'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'admin@gmail.com', password: 'Admin123!' });
      req.flush(mockResponse);
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when isAdminLoggedIn is true in localStorage', () => {
      localStorage.setItem('isAdminLoggedIn', 'true');
      expect(service.isLoggedIn()).toBeTrue();
    });

    it('should return false when isAdminLoggedIn is not set', () => {
      expect(service.isLoggedIn()).toBeFalse();
    });

    it('should return false when isAdminLoggedIn is false', () => {
      localStorage.setItem('isAdminLoggedIn', 'false');
      expect(service.isLoggedIn()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should remove isAdminLoggedIn from localStorage', () => {
      localStorage.setItem('isAdminLoggedIn', 'true');
      service.logout();
      expect(localStorage.getItem('isAdminLoggedIn')).toBeNull();
    });
  });
});
