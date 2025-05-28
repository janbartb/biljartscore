import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonScoreComponent } from './annon-score.component';

describe('AnnonScoreComponent', () => {
  let component: AnnonScoreComponent;
  let fixture: ComponentFixture<AnnonScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
