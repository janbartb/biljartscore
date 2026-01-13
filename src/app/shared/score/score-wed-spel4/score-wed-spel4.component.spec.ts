import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWedSpel4Component } from './score-wed-spel4.component';

describe('ScoreWedSpel4Component', () => {
  let component: ScoreWedSpel4Component;
  let fixture: ComponentFixture<ScoreWedSpel4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWedSpel4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWedSpel4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
