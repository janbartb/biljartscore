import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HgetalComponent } from './hgetal.component';

describe('HgetalComponent', () => {
  let component: HgetalComponent;
  let fixture: ComponentFixture<HgetalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HgetalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HgetalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
