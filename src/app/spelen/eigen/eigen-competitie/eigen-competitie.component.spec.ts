import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieComponent } from './eigen-competitie.component';

describe('EigenCompetitieComponent', () => {
  let component: EigenCompetitieComponent;
  let fixture: ComponentFixture<EigenCompetitieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
