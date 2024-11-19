import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchCompComponent } from './knbb-team-match-comp.component';

describe('KnbbTeamMatchCompComponent', () => {
  let component: KnbbTeamMatchCompComponent;
  let fixture: ComponentFixture<KnbbTeamMatchCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchCompComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
