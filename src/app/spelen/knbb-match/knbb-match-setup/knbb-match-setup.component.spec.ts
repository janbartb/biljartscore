import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchSetupComponent } from './knbb-match-setup.component';

describe('KnbbMatchSetupComponent', () => {
  let component: KnbbMatchSetupComponent;
  let fixture: ComponentFixture<KnbbMatchSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
