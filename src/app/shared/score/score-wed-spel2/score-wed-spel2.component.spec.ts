import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWedSpel2Component } from './score-wed-spel2.component';

describe('ScoreWedSpel2Component', () => {
  let component: ScoreWedSpel2Component;
  let fixture: ComponentFixture<ScoreWedSpel2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWedSpel2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWedSpel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
