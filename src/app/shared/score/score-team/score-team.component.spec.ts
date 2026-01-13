import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreTeamComponent } from './score-team.component';

describe('ScoreTeamComponent', () => {
  let component: ScoreTeamComponent;
  let fixture: ComponentFixture<ScoreTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
