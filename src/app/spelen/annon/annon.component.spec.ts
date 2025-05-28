import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonComponent } from './annon.component';

describe('AnnonComponent', () => {
  let component: AnnonComponent;
  let fixture: ComponentFixture<AnnonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
