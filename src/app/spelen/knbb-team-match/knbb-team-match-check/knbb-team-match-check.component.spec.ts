import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchCheckComponent } from './knbb-team-match-check.component';

describe('KnbbTeamMatchCheckComponent', () => {
  let component: KnbbTeamMatchCheckComponent;
  let fixture: ComponentFixture<KnbbTeamMatchCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchCheckComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
