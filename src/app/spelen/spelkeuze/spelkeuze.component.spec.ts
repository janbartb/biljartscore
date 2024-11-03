import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpelkeuzeComponent } from './spelkeuze.component';

describe('SpelkeuzeComponent', () => {
  let component: SpelkeuzeComponent;
  let fixture: ComponentFixture<SpelkeuzeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpelkeuzeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpelkeuzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
