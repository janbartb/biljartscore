import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbTeamMatchSpelerComponent } from './knbb-team-match-speler.component';

describe('KnbbTeamMatchSpelerComponent', () => {
  let component: KnbbTeamMatchSpelerComponent;
  let fixture: ComponentFixture<KnbbTeamMatchSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbTeamMatchSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbTeamMatchSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
