import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsCompetitieComponent } from './os-competitie.component';

describe('OsCompetitieComponent', () => {
  let component: OsCompetitieComponent;
  let fixture: ComponentFixture<OsCompetitieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsCompetitieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsCompetitieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
