import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonSpelerInfoComponent } from './annon-speler-info.component';

describe('AnnonSpelerInfoComponent', () => {
  let component: AnnonSpelerInfoComponent;
  let fixture: ComponentFixture<AnnonSpelerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonSpelerInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonSpelerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
