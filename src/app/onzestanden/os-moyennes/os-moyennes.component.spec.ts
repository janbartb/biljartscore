import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsMoyennesComponent } from './os-moyennes.component';

describe('OsMoyennesComponent', () => {
  let component: OsMoyennesComponent;
  let fixture: ComponentFixture<OsMoyennesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsMoyennesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsMoyennesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
