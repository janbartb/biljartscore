import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsCompetitieTeamsComponent } from './os-competitie-teams.component';

describe('OsCompetitieTeamsComponent', () => {
  let component: OsCompetitieTeamsComponent;
  let fixture: ComponentFixture<OsCompetitieTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsCompetitieTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsCompetitieTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
