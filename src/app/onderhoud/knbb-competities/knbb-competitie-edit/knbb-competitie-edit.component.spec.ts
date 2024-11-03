import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbCompetitieEditComponent } from './knbb-competitie-edit.component';

describe('KnbbCompetitieEditComponent', () => {
  let component: KnbbCompetitieEditComponent;
  let fixture: ComponentFixture<KnbbCompetitieEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbCompetitieEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbCompetitieEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
