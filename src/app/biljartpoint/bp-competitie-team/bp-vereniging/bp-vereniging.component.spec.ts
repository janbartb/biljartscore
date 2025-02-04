import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpVerenigingComponent } from './bp-vereniging.component';

describe('BpVerenigingComponent', () => {
  let component: BpVerenigingComponent;
  let fixture: ComponentFixture<BpVerenigingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpVerenigingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpVerenigingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
