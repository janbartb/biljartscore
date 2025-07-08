import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpTeamComponent } from './bp-team.component';

describe('BpTeamComponent', () => {
  let component: BpTeamComponent;
  let fixture: ComponentFixture<BpTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
