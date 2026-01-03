import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordTeamLeftComponent } from './scorebord-team-left.component';

describe('ScorebordTeamLeftComponent', () => {
  let component: ScorebordTeamLeftComponent;
  let fixture: ComponentFixture<ScorebordTeamLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordTeamLeftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordTeamLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
