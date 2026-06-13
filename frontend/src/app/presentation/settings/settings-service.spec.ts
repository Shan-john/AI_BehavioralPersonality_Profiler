import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SettingsService } from './settings-service';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SettingsService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserProfile', () => {
    it('should send GET request to /user/profile/{userId}', () => {
      const mockUser = { id: 1, email: 'test@gmail.com' };

      service.getUserProfile(1).subscribe(res => {
        expect(res).toEqual(mockUser);
      });

      const req = httpMock.expectOne(r => r.url.includes('/user/profile/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  describe('getReportByUserId', () => {
    it('should send GET request to /report/user/{userId}', () => {
      const mockReport = { hasReport: true, data: 'Some report data' };

      service.getReportByUserId(5).subscribe(res => {
        expect(res).toEqual(mockReport);
      });

      const req = httpMock.expectOne(r => r.url.includes('/report/user/5'));
      expect(req.request.method).toBe('GET');
      req.flush(mockReport);
    });

    it('should handle user with no report', () => {
      const mockReport = { hasReport: false, data: null };

      service.getReportByUserId(99).subscribe(res => {
        expect(res).toEqual(mockReport);
      });

      const req = httpMock.expectOne(r => r.url.includes('/report/user/99'));
      req.flush(mockReport);
    });
  });
});
