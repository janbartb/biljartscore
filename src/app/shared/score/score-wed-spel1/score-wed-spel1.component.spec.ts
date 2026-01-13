import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWedSpel1Component } from './score-wed-spel1.component';

describe('ScoreWedSpel1Component', () => {
  let component: ScoreWedSpel1Component;
  let fixture: ComponentFixture<ScoreWedSpel1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWedSpel1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWedSpel1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
