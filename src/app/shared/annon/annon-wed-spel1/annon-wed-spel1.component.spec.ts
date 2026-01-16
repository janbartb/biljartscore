import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonWedSpel1Component } from './annon-wed-spel1.component';

describe('AnnonWedSpel1Component', () => {
  let component: AnnonWedSpel1Component;
  let fixture: ComponentFixture<AnnonWedSpel1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonWedSpel1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonWedSpel1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
