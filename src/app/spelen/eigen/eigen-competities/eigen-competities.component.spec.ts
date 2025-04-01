import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitiesComponent } from './eigen-competities.component';

describe('EigenCompetitiesComponent', () => {
  let component: EigenCompetitiesComponent;
  let fixture: ComponentFixture<EigenCompetitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
