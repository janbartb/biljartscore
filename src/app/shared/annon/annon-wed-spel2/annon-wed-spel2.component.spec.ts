import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonWedSpel2Component } from './annon-wed-spel2.component';

describe('AnnonWedSpel2Component', () => {
  let component: AnnonWedSpel2Component;
  let fixture: ComponentFixture<AnnonWedSpel2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonWedSpel2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonWedSpel2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
