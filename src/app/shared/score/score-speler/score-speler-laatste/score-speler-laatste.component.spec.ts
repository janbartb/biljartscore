import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerLaatsteComponent } from './score-speler-laatste.component';

describe('ScoreSpelerLaatsteComponent', () => {
  let component: ScoreSpelerLaatsteComponent;
  let fixture: ComponentFixture<ScoreSpelerLaatsteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerLaatsteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerLaatsteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
