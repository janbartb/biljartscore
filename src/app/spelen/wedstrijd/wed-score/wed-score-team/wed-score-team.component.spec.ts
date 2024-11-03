import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedScoreTeamComponent } from './wed-score-team.component';

describe('WedScoreTeamComponent', () => {
  let component: WedScoreTeamComponent;
  let fixture: ComponentFixture<WedScoreTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedScoreTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedScoreTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
