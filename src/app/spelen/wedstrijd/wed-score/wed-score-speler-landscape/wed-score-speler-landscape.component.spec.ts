import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedScoreSpelerLandscapeComponent } from './wed-score-speler-landscape.component';

describe('WedScoreSpelerLandscapeComponent', () => {
  let component: WedScoreSpelerLandscapeComponent;
  let fixture: ComponentFixture<WedScoreSpelerLandscapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedScoreSpelerLandscapeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedScoreSpelerLandscapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
