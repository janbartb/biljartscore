import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnderhoudComponent } from './onderhoud.component';

describe('OnderhoudComponent', () => {
  let component: OnderhoudComponent;
  let fixture: ComponentFixture<OnderhoudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnderhoudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnderhoudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
