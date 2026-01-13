import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerComponent } from './score-speler.component';

describe('ScoreSpelerComponent', () => {
  let component: ScoreSpelerComponent;
  let fixture: ComponentFixture<ScoreSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
