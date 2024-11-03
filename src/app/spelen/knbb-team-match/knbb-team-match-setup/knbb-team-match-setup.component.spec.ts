import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchSetupComponent } from './knbb-team-match-setup.component';

describe('KnbbTeamMatchSetupComponent', () => {
  let component: KnbbTeamMatchSetupComponent;
  let fixture: ComponentFixture<KnbbTeamMatchSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
