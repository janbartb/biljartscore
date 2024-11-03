import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerenigingTeamComponent } from './vereniging-team.component';

describe('VerenigingTeamComponent', () => {
  let component: VerenigingTeamComponent;
  let fixture: ComponentFixture<VerenigingTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerenigingTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerenigingTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
