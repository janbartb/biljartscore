import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieWedsComponent } from './eigen-competitie-weds.component';

describe('EigenCompetitieWedsComponent', () => {
  let component: EigenCompetitieWedsComponent;
  let fixture: ComponentFixture<EigenCompetitieWedsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieWedsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieWedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
