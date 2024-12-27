import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchLijstSpelerComponent } from './knbb-match-lijst-speler.component';

describe('KnbbMatchLijstSpelerComponent', () => {
  let component: KnbbMatchLijstSpelerComponent;
  let fixture: ComponentFixture<KnbbMatchLijstSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchLijstSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchLijstSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
