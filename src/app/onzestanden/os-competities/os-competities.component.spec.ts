import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsCompetitiesComponent } from './os-competities.component';

describe('OsCompetitiesComponent', () => {
  let component: OsCompetitiesComponent;
  let fixture: ComponentFixture<OsCompetitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsCompetitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsCompetitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
