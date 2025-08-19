import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTeamComponent } from './scorebord-team.component';

describe('ScorebordTeamComponent', () => {
  let component: ScorebordTeamComponent;
  let fixture: ComponentFixture<ScorebordTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
