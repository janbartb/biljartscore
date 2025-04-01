import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieSchemaComponent } from './eigen-competitie-schema.component';

describe('EigenCompetitieSchemaComponent', () => {
  let component: EigenCompetitieSchemaComponent;
  let fixture: ComponentFixture<EigenCompetitieSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieSchemaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
