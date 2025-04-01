import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEndOfMatchComponent } from './confirm-end-of-match.component';

describe('ConfirmEndOfMatchComponent', () => {
  let component: ConfirmEndOfMatchComponent;
  let fixture: ComponentFixture<ConfirmEndOfMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmEndOfMatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmEndOfMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
