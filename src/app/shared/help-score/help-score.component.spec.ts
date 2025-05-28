import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpScoreComponent } from './help-score.component';

describe('HelpScoreComponent', () => {
  let component: HelpScoreComponent;
  let fixture: ComponentFixture<HelpScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
