import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonSpelerStandComponent } from './annon-speler-stand.component';

describe('AnnonSpelerStandComponent', () => {
  let component: AnnonSpelerStandComponent;
  let fixture: ComponentFixture<AnnonSpelerStandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonSpelerStandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonSpelerStandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
