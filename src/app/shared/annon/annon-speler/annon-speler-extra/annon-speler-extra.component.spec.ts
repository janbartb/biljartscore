import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonSpelerExtraComponent } from './annon-speler-extra.component';

describe('AnnonSpelerExtraComponent', () => {
  let component: AnnonSpelerExtraComponent;
  let fixture: ComponentFixture<AnnonSpelerExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonSpelerExtraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonSpelerExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
