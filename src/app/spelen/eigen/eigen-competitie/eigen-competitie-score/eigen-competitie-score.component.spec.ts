import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieScoreComponent } from './eigen-competitie-score.component';

describe('EigenCompetitieScoreComponent', () => {
  let component: EigenCompetitieScoreComponent;
  let fixture: ComponentFixture<EigenCompetitieScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
