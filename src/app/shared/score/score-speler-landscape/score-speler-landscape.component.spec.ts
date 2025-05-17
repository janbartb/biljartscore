import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerLandscapeComponent } from './score-speler-landscape.component';

describe('ScoreSpelerLandscapeComponent', () => {
  let component: ScoreSpelerLandscapeComponent;
  let fixture: ComponentFixture<ScoreSpelerLandscapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerLandscapeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerLandscapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
