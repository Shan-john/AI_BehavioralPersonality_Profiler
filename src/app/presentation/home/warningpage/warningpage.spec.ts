import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Warningpage } from './warningpage';

describe('Warningpage', () => {
  let component: Warningpage;
  let fixture: ComponentFixture<Warningpage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Warningpage],
    }).compileComponents();

    fixture = TestBed.createComponent(Warningpage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
