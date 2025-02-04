import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpDistrictenComponent } from './bp-districten.component';

describe('BpDistrictenComponent', () => {
  let component: BpDistrictenComponent;
  let fixture: ComponentFixture<BpDistrictenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpDistrictenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpDistrictenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
