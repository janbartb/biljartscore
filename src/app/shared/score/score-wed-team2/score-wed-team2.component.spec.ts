import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWedTeam2Component } from './score-wed-team2.component';

describe('ScoreWedTeam2Component', () => {
  let component: ScoreWedTeam2Component;
  let fixture: ComponentFixture<ScoreWedTeam2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWedTeam2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWedTeam2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
