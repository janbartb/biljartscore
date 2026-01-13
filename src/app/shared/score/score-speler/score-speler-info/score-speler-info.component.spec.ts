import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerInfoComponent } from './score-speler-info.component';

describe('ScoreSpelerInfoComponent', () => {
  let component: ScoreSpelerInfoComponent;
  let fixture: ComponentFixture<ScoreSpelerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
