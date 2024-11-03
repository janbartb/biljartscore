import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbCompetitieEditTeamsComponent } from './knbb-competitie-edit-teams.component';

describe('KnbbCompetitieEditTeamsComponent', () => {
  let component: KnbbCompetitieEditTeamsComponent;
  let fixture: ComponentFixture<KnbbCompetitieEditTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbCompetitieEditTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbCompetitieEditTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
