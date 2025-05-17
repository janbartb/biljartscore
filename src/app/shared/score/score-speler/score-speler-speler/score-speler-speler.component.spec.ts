import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerSpelerComponent } from './score-speler-speler.component';

describe('ScoreSpelerSpelerComponent', () => {
  let component: ScoreSpelerSpelerComponent;
  let fixture: ComponentFixture<ScoreSpelerSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
