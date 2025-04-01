import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitiesComponent } from './competities.component';

describe('CompetitiesComponent', () => {
  let component: CompetitiesComponent;
  let fixture: ComponentFixture<CompetitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
