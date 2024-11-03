import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerenigingAddComponent } from './vereniging-add.component';

describe('VerenigingAddComponent', () => {
  let component: VerenigingAddComponent;
  let fixture: ComponentFixture<VerenigingAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerenigingAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerenigingAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
