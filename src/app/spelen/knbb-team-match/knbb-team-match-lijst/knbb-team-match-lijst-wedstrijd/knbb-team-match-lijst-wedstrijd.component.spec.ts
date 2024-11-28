import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchLijstWedstrijdComponent } from './knbb-team-match-lijst-wedstrijd.component';

describe('KnbbTeamMatchLijstWedstrijdComponent', () => {
  let component: KnbbTeamMatchLijstWedstrijdComponent;
  let fixture: ComponentFixture<KnbbTeamMatchLijstWedstrijdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchLijstWedstrijdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchLijstWedstrijdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
