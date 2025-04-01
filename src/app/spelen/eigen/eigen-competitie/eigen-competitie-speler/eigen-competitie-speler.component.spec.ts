import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieSpelerComponent } from './eigen-competitie-speler.component';

describe('EigenCompetitieSpelerComponent', () => {
  let component: EigenCompetitieSpelerComponent;
  let fixture: ComponentFixture<EigenCompetitieSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
