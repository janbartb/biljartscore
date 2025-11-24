import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerenigingViewComponent } from './vereniging-view.component';

describe('VerenigingViewComponent', () => {
  let component: VerenigingViewComponent;
  let fixture: ComponentFixture<VerenigingViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerenigingViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerenigingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
