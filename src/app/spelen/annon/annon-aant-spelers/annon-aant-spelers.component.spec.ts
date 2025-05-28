import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonAantSpelersComponent } from './annon-aant-spelers.component';

describe('AnnonAantSpelersComponent', () => {
  let component: AnnonAantSpelersComponent;
  let fixture: ComponentFixture<AnnonAantSpelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonAantSpelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonAantSpelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
