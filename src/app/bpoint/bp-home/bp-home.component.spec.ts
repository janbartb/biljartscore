import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpHomeComponent } from './bp-home.component';

describe('BpHomeComponent', () => {
  let component: BpHomeComponent;
  let fixture: ComponentFixture<BpHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
