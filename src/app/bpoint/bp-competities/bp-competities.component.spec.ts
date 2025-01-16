import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpCompetitiesComponent } from './bp-competities.component';

describe('BpCompetitiesComponent', () => {
  let component: BpCompetitiesComponent;
  let fixture: ComponentFixture<BpCompetitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpCompetitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpCompetitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
