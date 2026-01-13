import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWideStandComponent } from './score-wide-stand.component';

describe('ScoreWideStandComponent', () => {
  let component: ScoreWideStandComponent;
  let fixture: ComponentFixture<ScoreWideStandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWideStandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWideStandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
