import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchCheckComponent } from './knbb-match-check.component';

describe('KnbbMatchCheckComponent', () => {
  let component: KnbbMatchCheckComponent;
  let fixture: ComponentFixture<KnbbMatchCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchCheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
