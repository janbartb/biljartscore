import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWideVoortgangComponent } from './score-wide-voortgang.component';

describe('ScoreWideVoortgangComponent', () => {
  let component: ScoreWideVoortgangComponent;
  let fixture: ComponentFixture<ScoreWideVoortgangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWideVoortgangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWideVoortgangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
