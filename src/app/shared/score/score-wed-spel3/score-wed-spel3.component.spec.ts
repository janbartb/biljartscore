import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWedSpel3Component } from './score-wed-spel3.component';

describe('ScoreWedSpel3Component', () => {
  let component: ScoreWedSpel3Component;
  let fixture: ComponentFixture<ScoreWedSpel3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWedSpel3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWedSpel3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
