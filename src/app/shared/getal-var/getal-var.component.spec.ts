import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetalVarComponent } from './getal-var.component';

describe('GetalVarComponent', () => {
  let component: GetalVarComponent;
  let fixture: ComponentFixture<GetalVarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetalVarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetalVarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
