import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieScoreSpelerComponent } from './eigen-competitie-score-speler.component';

describe('EigenCompetitieScoreSpelerComponent', () => {
  let component: EigenCompetitieScoreSpelerComponent;
  let fixture: ComponentFixture<EigenCompetitieScoreSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieScoreSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieScoreSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
