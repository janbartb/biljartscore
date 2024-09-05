import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpelsoortenComponent } from './spelsoorten.component';

describe('SpelsoortenComponent', () => {
  let component: SpelsoortenComponent;
  let fixture: ComponentFixture<SpelsoortenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpelsoortenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpelsoortenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
