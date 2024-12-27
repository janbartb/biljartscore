import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchScoreComponent } from './knbb-match-score.component';

describe('KnbbMatchScoreComponent', () => {
  let component: KnbbMatchScoreComponent;
  let fixture: ComponentFixture<KnbbMatchScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
