import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedScoreComponent } from './wed-score.component';

describe('WedScoreComponent', () => {
  let component: WedScoreComponent;
  let fixture: ComponentFixture<WedScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
