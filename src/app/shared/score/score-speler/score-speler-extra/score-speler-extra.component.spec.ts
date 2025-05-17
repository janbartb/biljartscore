import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerExtraComponent } from './score-speler-extra.component';

describe('ScoreSpelerExtraComponent', () => {
  let component: ScoreSpelerExtraComponent;
  let fixture: ComponentFixture<ScoreSpelerExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerExtraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
