import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpCompetitieTeamsComponent } from './bp-competitie-teams.component';

describe('BpCompetitieTeamsComponent', () => {
  let component: BpCompetitieTeamsComponent;
  let fixture: ComponentFixture<BpCompetitieTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpCompetitieTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpCompetitieTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
