import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompSpelersComponent } from './comp-spelers.component';

describe('CompSpelersComponent', () => {
  let component: CompSpelersComponent;
  let fixture: ComponentFixture<CompSpelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompSpelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompSpelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
