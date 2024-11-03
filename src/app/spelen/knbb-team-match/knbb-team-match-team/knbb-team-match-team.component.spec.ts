import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchTeamComponent } from './knbb-team-match-team.component';

describe('KnbbTeamMatchTeamComponent', () => {
  let component: KnbbTeamMatchTeamComponent;
  let fixture: ComponentFixture<KnbbTeamMatchTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
