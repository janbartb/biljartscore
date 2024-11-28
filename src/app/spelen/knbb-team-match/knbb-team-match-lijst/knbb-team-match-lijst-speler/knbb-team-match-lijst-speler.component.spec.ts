import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchLijstSpelerComponent } from './knbb-team-match-lijst-speler.component';

describe('KnbbTeamMatchLijstSpelerComponent', () => {
  let component: KnbbTeamMatchLijstSpelerComponent;
  let fixture: ComponentFixture<KnbbTeamMatchLijstSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchLijstSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchLijstSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
