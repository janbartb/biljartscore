import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedScoreSpelerComponent } from './wed-score-speler.component';

describe('WedScoreSpelerComponent', () => {
  let component: WedScoreSpelerComponent;
  let fixture: ComponentFixture<WedScoreSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedScoreSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedScoreSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
