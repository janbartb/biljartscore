import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchScoreSpelerComponent } from './knbb-team-match-score-speler.component';

describe('KnbbTeamMatchScoreSpelerComponent', () => {
  let component: KnbbTeamMatchScoreSpelerComponent;
  let fixture: ComponentFixture<KnbbTeamMatchScoreSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchScoreSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchScoreSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
