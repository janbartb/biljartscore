import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CijferComponent } from './cijfer.component';

describe('CijferComponent', () => {
  let component: CijferComponent;
  let fixture: ComponentFixture<CijferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CijferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CijferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
