import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchScoreComponent } from './knbb-team-match-score.component';

describe('KnbbTeamMatchScoreComponent', () => {
  let component: KnbbTeamMatchScoreComponent;
  let fixture: ComponentFixture<KnbbTeamMatchScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
