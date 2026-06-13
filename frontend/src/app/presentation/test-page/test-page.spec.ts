import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TestPage } from './test-page';
import { ChatService } from './test-service';

describe('TestPage', () => {
  let component: TestPage;
  let fixture: ComponentFixture<TestPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockChatService: jasmine.SpyObj<ChatService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockChatService = jasmine.createSpyObj('ChatService', ['sendMessage']);

    await TestBed.configureTestingModule({
      imports: [TestPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ChatService, useValue: mockChatService }
      ]
    }).compileComponents();

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  function createComponent() {
    fixture = TestBed.createComponent(TestPage);
    component = fixture.componentInstance;
    // Provide a mock chatContainer to avoid null errors
    component.chatContainer = new ElementRef(document.createElement('div'));
  }

  it('should create', () => {
    localStorage.setItem('id', '1');
    localStorage.setItem('loginStatus', 'true');
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should redirect to signup when not logged in', fakeAsync(() => {
    createComponent();
    component.ngOnInit();
    tick(5000);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
  }));

  it('should redirect to signup when id is undefined string', fakeAsync(() => {
    localStorage.setItem('id', 'undefined');
    localStorage.setItem('loginStatus', 'true');
    createComponent();
    component.ngOnInit();
    tick(5000);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
  }));

  describe('onMessageSubmit', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createComponent();
    });

    it('should not send when message is empty', () => {
      component.messages = '';
      component.onMessageSubmit('');
      expect(mockChatService.sendMessage).not.toHaveBeenCalled();
    });

    it('should increment questionCount and call send', () => {
      mockChatService.sendMessage.and.returnValue(of({ data: 'AI response', questionNumber: 1 }));
      component.messages = 'Hello';
      component.onMessageSubmit('Hello');
      expect(component.questionCount).toBe(1);
      expect(mockChatService.sendMessage).toHaveBeenCalled();
    });

    it('should add user message to messagelist', () => {
      mockChatService.sendMessage.and.returnValue(of({ data: 'AI response', questionNumber: 1 }));
      component.messages = 'Hello';
      const initialLength = component.messagelist.length;
      component.onMessageSubmit('Hello');
      expect(component.messagelist.length).toBeGreaterThan(initialLength);
    });
  });

  describe('handleEnter', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createComponent();
    });

    it('should call preventDefault when Enter is pressed without Shift', () => {
      const event = { shiftKey: false, preventDefault: jasmine.createSpy('preventDefault') };
      component.handleEnter(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should not call preventDefault when Shift+Enter is pressed', () => {
      const event = { shiftKey: true, preventDefault: jasmine.createSpy('preventDefault') };
      component.handleEnter(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('send', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createComponent();
    });

    it('should update progress based on questionNumber', () => {
      mockChatService.sendMessage.and.returnValue(of({ data: 'response', questionNumber: 5 }));
      component.send('test', 1, 1);
      expect(component.progress).toBe((5 / 15) * 100);
    });

    it('should set progress to 100 when test is complete (no questionNumber)', fakeAsync(() => {
      mockChatService.sendMessage.and.returnValue(of({ data: 'final response' }));
      component.send('test', 1, 15);
      expect(component.progress).toBe(100);
      tick(3000);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home/settings']);
    }));

    it('should add error message on failure', () => {
      mockChatService.sendMessage.and.returnValue(throwError(() => new Error('fail')));
      component.send('test', 1, 1);
      const lastMessage = component.messagelist[component.messagelist.length - 1];
      expect(lastMessage.sender).toBe('ai');
      expect(lastMessage.text).toContain('error');
    });
  });

  describe('delay', () => {
    beforeEach(() => {
      localStorage.setItem('id', '1');
      localStorage.setItem('loginStatus', 'true');
      createComponent();
    });

    it('should return a promise that resolves after specified time', fakeAsync(() => {
      let resolved = false;
      component.delay(500).then(() => { resolved = true; });
      expect(resolved).toBeFalse();
      tick(500);
      expect(resolved).toBeTrue();
    }));
  });
});
