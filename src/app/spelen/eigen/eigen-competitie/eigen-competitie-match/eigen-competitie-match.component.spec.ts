import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieMatchComponent } from './eigen-competitie-match.component';

describe('EigenCompetitieMatchComponent', () => {
  let component: EigenCompetitieMatchComponent;
  let fixture: ComponentFixture<EigenCompetitieMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieMatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
