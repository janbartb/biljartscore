import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWideExtraComponent } from './score-wide-extra.component';

describe('ScoreWideExtraComponent', () => {
  let component: ScoreWideExtraComponent;
  let fixture: ComponentFixture<ScoreWideExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWideExtraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWideExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
