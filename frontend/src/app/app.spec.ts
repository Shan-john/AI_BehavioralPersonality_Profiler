import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterModule.forRoot([])]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have the correct title signal value', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    expect(component['title']()).toBe('AI_BehavioralPersonality_Profiler');
  });

  it('should start with showSplash as true', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    expect(component.showSplash).toBeTrue();
  });

  it('should set showSplash to false after timeout', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    
    expect(component.showSplash).toBeTrue();
    tick(5000);
    expect(component.showSplash).toBeFalse();
  }));
});
