import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AdminHomepageService } from './admin-homepageService';

describe('AdminHomepageService', () => {
  let service: AdminHomepageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminHomepageService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AdminHomepageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllUsers', () => {
    it('should send GET request to /user/all', () => {
      const mockUsers = [
        { id: 1, email: 'user1@gmail.com' },
        { id: 2, email: 'user2@gmail.com' }
      ];

      service.getAllUsers().subscribe(res => {
        expect(res).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(r => r.url.includes('/user/all'));
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });
  });

  describe('getReportByUserId', () => {
    it('should send GET request to /report/user/{userId}', () => {
      const mockReport = { hasReport: true, data: 'Report content', userId: 1 };

      service.getReportByUserId(1).subscribe(res => {
        expect(res).toEqual(mockReport);
      });

      const req = httpMock.expectOne(r => r.url.includes('/report/user/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockReport);
    });
  });
});
