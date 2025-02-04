import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpCompetitieComponent } from './bp-competitie.component';

describe('BpCompetitieComponent', () => {
  let component: BpCompetitieComponent;
  let fixture: ComponentFixture<BpCompetitieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpCompetitieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpCompetitieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
