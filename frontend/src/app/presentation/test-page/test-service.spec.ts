import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChatService } from './test-service';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sendMessage', () => {
    it('should send POST request with correct body and userId query param', () => {
      const body = { answer: 'Yes, I am ready', questionCount: 1 };
      const mockResponse = { data: 'What motivates you?', questionNumber: 1 };

      service.sendMessage(42, body).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(r =>
        r.url.includes('/ai/chat') && r.params.get('userId') === '42'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });

    it('should handle userId of 0', () => {
      const body = { answer: 'test', questionCount: 1 };

      service.sendMessage(0, body).subscribe();

      const req = httpMock.expectOne(r =>
        r.url.includes('/ai/chat') && r.params.get('userId') === '0'
      );
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });
});
