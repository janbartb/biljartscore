import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchSpelerComponent } from './knbb-match-speler.component';

describe('KnbbMatchSpelerComponent', () => {
  let component: KnbbMatchSpelerComponent;
  let fixture: ComponentFixture<KnbbMatchSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
