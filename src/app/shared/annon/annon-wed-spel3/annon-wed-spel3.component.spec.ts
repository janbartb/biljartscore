import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonWedSpel3Component } from './annon-wed-spel3.component';

describe('AnnonWedSpel3Component', () => {
  let component: AnnonWedSpel3Component;
  let fixture: ComponentFixture<AnnonWedSpel3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonWedSpel3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonWedSpel3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
