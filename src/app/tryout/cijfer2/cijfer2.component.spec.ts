import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cijfer2Component } from './cijfer2.component';

describe('Cijfer2Component', () => {
  let component: Cijfer2Component;
  let fixture: ComponentFixture<Cijfer2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cijfer2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cijfer2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
