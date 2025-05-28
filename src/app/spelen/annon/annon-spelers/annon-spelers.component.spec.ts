import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonSpelersComponent } from './annon-spelers.component';

describe('AnnonSpelersComponent', () => {
  let component: AnnonSpelersComponent;
  let fixture: ComponentFixture<AnnonSpelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonSpelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonSpelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
