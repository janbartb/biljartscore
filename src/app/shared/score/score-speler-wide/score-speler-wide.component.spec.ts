import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSpelerWideComponent } from './score-speler-wide.component';

describe('ScoreSpelerWideComponent', () => {
  let component: ScoreSpelerWideComponent;
  let fixture: ComponentFixture<ScoreSpelerWideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreSpelerWideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreSpelerWideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
