import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SplashService } from './splashService';

describe('SplashService', () => {
  let service: SplashService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SplashService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(SplashService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUser', () => {
    it('should send GET request with correct user ID in URL', () => {
      const mockUser = { id: 5, email: 'user@gmail.com' };

      service.getUser(5).subscribe(res => {
        expect(res).toEqual(mockUser);
      });

      const req = httpMock.expectOne(r => r.url.includes('/user/profile/5'));
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should interpolate string IDs correctly', () => {
      service.getUser('10').subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/user/profile/10'));
      expect(req.request.method).toBe('GET');
      req.flush({});
    });
  });
});
