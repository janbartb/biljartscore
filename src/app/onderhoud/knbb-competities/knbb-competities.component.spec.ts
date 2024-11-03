import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbCompetitiesComponent } from './knbb-competities.component';

describe('KnbbCompetitiesComponent', () => {
  let component: KnbbCompetitiesComponent;
  let fixture: ComponentFixture<KnbbCompetitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbCompetitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbCompetitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
