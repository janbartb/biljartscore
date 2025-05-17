import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerScoreComponent } from './score-speler-score.component';

describe('ScoreSpelerScoreComponent', () => {
  let component: ScoreSpelerScoreComponent;
  let fixture: ComponentFixture<ScoreSpelerScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
