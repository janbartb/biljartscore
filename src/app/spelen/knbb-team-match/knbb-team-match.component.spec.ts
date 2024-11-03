import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchComponent } from './knbb-team-match.component';

describe('KnbbTeamMatchComponent', () => {
  let component: KnbbTeamMatchComponent;
  let fixture: ComponentFixture<KnbbTeamMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
