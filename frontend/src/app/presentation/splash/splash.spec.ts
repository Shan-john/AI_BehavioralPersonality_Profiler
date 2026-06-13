import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Splash } from './splash';
import { SplashService } from './splashService';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Splash', () => {
  let component: Splash;
  let fixture: ComponentFixture<Splash>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Splash],
      providers: [
        { provide: Router, useValue: mockRouter },
        SplashService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', fakeAsync(() => {
    fixture = TestBed.createComponent(Splash);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    tick(5000);
  }));

  it('should set status to true when valid user is logged in', fakeAsync(() => {
    localStorage.setItem('id', '5');
    localStorage.setItem('loginStatus', 'true');

    fixture = TestBed.createComponent(Splash);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.status).toBeTrue();
    tick(5000);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should set status to false when no user is logged in', fakeAsync(() => {
    fixture = TestBed.createComponent(Splash);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.status).toBeFalse();
    tick(5000);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
  }));

  it('should clean up invalid id and navigate to signup', fakeAsync(() => {
    localStorage.setItem('id', 'abc');
    localStorage.setItem('loginStatus', 'true');

    fixture = TestBed.createComponent(Splash);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.status).toBeFalse();
    tick(5000);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
  }));

  it('should navigate to signup when loginStatus is not true', fakeAsync(() => {
    localStorage.setItem('id', '5');
    localStorage.setItem('loginStatus', 'false');

    fixture = TestBed.createComponent(Splash);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.status).toBeFalse();
    tick(5000);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
  }));
});
