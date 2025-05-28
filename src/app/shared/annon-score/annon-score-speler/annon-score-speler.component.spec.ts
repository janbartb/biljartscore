import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonScoreSpelerComponent } from './annon-score-speler.component';

describe('AnnonScoreSpelerComponent', () => {
  let component: AnnonScoreSpelerComponent;
  let fixture: ComponentFixture<AnnonScoreSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonScoreSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonScoreSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
