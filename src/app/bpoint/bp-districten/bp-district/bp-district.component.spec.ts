import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpDistrictComponent } from './bp-district.component';

describe('BpDistrictComponent', () => {
  let component: BpDistrictComponent;
  let fixture: ComponentFixture<BpDistrictComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpDistrictComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpDistrictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
