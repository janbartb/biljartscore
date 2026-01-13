import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerStandComponent } from './score-speler-stand.component';

describe('ScoreSpelerStandComponent', () => {
  let component: ScoreSpelerStandComponent;
  let fixture: ComponentFixture<ScoreSpelerStandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerStandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerStandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
