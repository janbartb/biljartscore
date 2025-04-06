import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmBordnaamComponent } from './confirm-bordnaam.component';

describe('ConfirmBordnaamComponent', () => {
  let component: ConfirmBordnaamComponent;
  let fixture: ComponentFixture<ConfirmBordnaamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmBordnaamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmBordnaamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
