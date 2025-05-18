import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchScorebordComponent } from './knbb-team-match-scorebord.component';

describe('KnbbTeamMatchScorebordComponent', () => {
  let component: KnbbTeamMatchScorebordComponent;
  let fixture: ComponentFixture<KnbbTeamMatchScorebordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchScorebordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchScorebordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
