import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonWedSpel4Component } from './annon-wed-spel4.component';

describe('AnnonWedSpel4Component', () => {
  let component: AnnonWedSpel4Component;
  let fixture: ComponentFixture<AnnonWedSpel4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonWedSpel4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonWedSpel4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
