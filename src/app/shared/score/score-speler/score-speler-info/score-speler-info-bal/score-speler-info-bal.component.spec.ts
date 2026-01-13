import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerInfoBalComponent } from './score-speler-info-bal.component';

describe('ScoreSpelerInfoBalComponent', () => {
  let component: ScoreSpelerInfoBalComponent;
  let fixture: ComponentFixture<ScoreSpelerInfoBalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerInfoBalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerInfoBalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
