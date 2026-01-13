import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWideLaatste5Component } from './score-wide-laatste5.component';

describe('ScoreWideLaatste5Component', () => {
  let component: ScoreWideLaatste5Component;
  let fixture: ComponentFixture<ScoreWideLaatste5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWideLaatste5Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWideLaatste5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
