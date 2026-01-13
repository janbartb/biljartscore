import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerVoortgangComponent } from './score-speler-voortgang.component';

describe('ScoreSpelerVoortgangComponent', () => {
  let component: ScoreSpelerVoortgangComponent;
  let fixture: ComponentFixture<ScoreSpelerVoortgangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerVoortgangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerVoortgangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
