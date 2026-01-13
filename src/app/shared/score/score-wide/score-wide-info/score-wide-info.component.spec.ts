import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWideInfoComponent } from './score-wide-info.component';

describe('ScoreWideInfoComponent', () => {
  let component: ScoreWideInfoComponent;
  let fixture: ComponentFixture<ScoreWideInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWideInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWideInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
