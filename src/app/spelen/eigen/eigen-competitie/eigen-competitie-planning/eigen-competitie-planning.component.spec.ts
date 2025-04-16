import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitiePlanningComponent } from './eigen-competitie-planning.component';

describe('EigenCompetitiePlanningComponent', () => {
  let component: EigenCompetitiePlanningComponent;
  let fixture: ComponentFixture<EigenCompetitiePlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitiePlanningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitiePlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
