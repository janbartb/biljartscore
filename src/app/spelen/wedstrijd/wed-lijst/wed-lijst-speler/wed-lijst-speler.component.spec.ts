import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedLijstSpelerComponent } from './wed-lijst-speler.component';

describe('WedLijstSpelerComponent', () => {
  let component: WedLijstSpelerComponent;
  let fixture: ComponentFixture<WedLijstSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedLijstSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedLijstSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
