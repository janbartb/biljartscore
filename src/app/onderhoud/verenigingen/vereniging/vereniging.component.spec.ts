import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerenigingComponent } from './vereniging.component';

describe('VerenigingComponent', () => {
  let component: VerenigingComponent;
  let fixture: ComponentFixture<VerenigingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerenigingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerenigingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
