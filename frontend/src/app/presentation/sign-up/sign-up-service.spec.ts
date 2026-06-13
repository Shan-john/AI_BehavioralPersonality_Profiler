import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SignUpService } from './sign-up-service';

describe('SignUpService', () => {
  let service: SignUpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SignUpService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(SignUpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('userRegister', () => {
    it('should send a POST request to the register API', () => {
      const mockResponse = { userId: 1, role: 'User' };

      service.userRegister('test@gmail.com', 'Password1!').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r => r.url.includes('/user/register'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@gmail.com', password: 'Password1!' });
      req.flush(mockResponse);
    });
  });

  describe('userLogin', () => {
    it('should send a POST request to the login API', () => {
      const mockResponse = { userId: 1, role: 'User' };

      service.userLogin('test@gmail.com', 'Password1!').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r => r.url.includes('/user/login'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@gmail.com', password: 'Password1!' });
      req.flush(mockResponse);
    });
  });
});
