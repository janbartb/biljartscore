import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpCompetitieTeamComponent } from './bp-competitie-team.component';

describe('BpCompetitieTeamComponent', () => {
  let component: BpCompetitieTeamComponent;
  let fixture: ComponentFixture<BpCompetitieTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpCompetitieTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpCompetitieTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
