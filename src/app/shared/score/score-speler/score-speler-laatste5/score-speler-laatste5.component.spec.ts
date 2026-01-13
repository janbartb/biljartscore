import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerLaatste5Component } from './score-speler-laatste5.component';

describe('ScoreSpelerLaatste5Component', () => {
  let component: ScoreSpelerLaatste5Component;
  let fixture: ComponentFixture<ScoreSpelerLaatste5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerLaatste5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerLaatste5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
