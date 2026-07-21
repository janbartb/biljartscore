import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsTeamComponent } from './os-team.component';

describe('OsTeamComponent', () => {
  let component: OsTeamComponent;
  let fixture: ComponentFixture<OsTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
