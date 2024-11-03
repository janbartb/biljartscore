import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerenigingEditComponent } from './vereniging-edit.component';

describe('VerenigingEditComponent', () => {
  let component: VerenigingEditComponent;
  let fixture: ComponentFixture<VerenigingEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerenigingEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerenigingEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
