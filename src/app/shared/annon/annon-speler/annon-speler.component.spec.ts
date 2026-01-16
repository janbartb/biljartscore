import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonSpelerComponent } from './annon-speler.component';

describe('AnnonSpelerComponent', () => {
  let component: AnnonSpelerComponent;
  let fixture: ComponentFixture<AnnonSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
