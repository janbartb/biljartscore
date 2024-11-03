import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbCompetitieAddComponent } from './knbb-competitie-add.component';

describe('KnbbCompetitieAddComponent', () => {
  let component: KnbbCompetitieAddComponent;
  let fixture: ComponentFixture<KnbbCompetitieAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbCompetitieAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbCompetitieAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
