import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonScoreTeamComponent } from './annon-score-team.component';

describe('AnnonScoreTeamComponent', () => {
  let component: AnnonScoreTeamComponent;
  let fixture: ComponentFixture<AnnonScoreTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonScoreTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonScoreTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
