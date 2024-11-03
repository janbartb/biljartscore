import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbDistrictenComponent } from './knbb-districten.component';

describe('KnbbDistrictenComponent', () => {
  let component: KnbbDistrictenComponent;
  let fixture: ComponentFixture<KnbbDistrictenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbDistrictenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbDistrictenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
