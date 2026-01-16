import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonSpelerWideComponent } from './annon-speler-wide.component';

describe('AnnonSpelerWideComponent', () => {
  let component: AnnonSpelerWideComponent;
  let fixture: ComponentFixture<AnnonSpelerWideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonSpelerWideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonSpelerWideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
