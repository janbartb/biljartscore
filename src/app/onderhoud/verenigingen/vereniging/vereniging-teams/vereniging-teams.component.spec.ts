import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerenigingTeamsComponent } from './vereniging-teams.component';

describe('VerenigingTeamsComponent', () => {
  let component: VerenigingTeamsComponent;
  let fixture: ComponentFixture<VerenigingTeamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerenigingTeamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerenigingTeamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
