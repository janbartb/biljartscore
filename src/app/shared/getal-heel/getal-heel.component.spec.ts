import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetalHeelComponent } from './getal-heel.component';

describe('GetalHeelComponent', () => {
  let component: GetalHeelComponent;
  let fixture: ComponentFixture<GetalHeelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetalHeelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetalHeelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
