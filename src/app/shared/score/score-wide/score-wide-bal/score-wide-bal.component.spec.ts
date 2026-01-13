import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreWideBalComponent } from './score-wide-bal.component';

describe('ScoreWideBalComponent', () => {
  let component: ScoreWideBalComponent;
  let fixture: ComponentFixture<ScoreWideBalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreWideBalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreWideBalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
