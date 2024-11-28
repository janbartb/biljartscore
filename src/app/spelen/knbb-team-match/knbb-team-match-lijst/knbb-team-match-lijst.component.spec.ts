import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchLijstComponent } from './knbb-team-match-lijst.component';

describe('KnbbTeamMatchLijstComponent', () => {
  let component: KnbbTeamMatchLijstComponent;
  let fixture: ComponentFixture<KnbbTeamMatchLijstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchLijstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchLijstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
