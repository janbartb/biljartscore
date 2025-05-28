import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonScoreSpelerLandscapeComponent } from './annon-score-speler-landscape.component';

describe('AnnonScoreSpelerLandscapeComponent', () => {
  let component: AnnonScoreSpelerLandscapeComponent;
  let fixture: ComponentFixture<AnnonScoreSpelerLandscapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonScoreSpelerLandscapeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonScoreSpelerLandscapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
