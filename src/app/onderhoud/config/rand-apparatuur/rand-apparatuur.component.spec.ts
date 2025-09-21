import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandApparatuurComponent } from './rand-apparatuur.component';

describe('RandApparatuurComponent', () => {
  let component: RandApparatuurComponent;
  let fixture: ComponentFixture<RandApparatuurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandApparatuurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RandApparatuurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
