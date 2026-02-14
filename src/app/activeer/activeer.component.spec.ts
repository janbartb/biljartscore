import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveerComponent } from './activeer.component';

describe('ActiveerComponent', () => {
  let component: ActiveerComponent;
  let fixture: ComponentFixture<ActiveerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
