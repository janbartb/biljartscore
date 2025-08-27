import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Getal2Component } from './getal2.component';

describe('Getal2Component', () => {
  let component: Getal2Component;
  let fixture: ComponentFixture<Getal2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Getal2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Getal2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
