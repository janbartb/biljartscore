import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordSpelerComponent } from './scorebord-speler.component';

describe('ScorebordSpelerComponent', () => {
  let component: ScorebordSpelerComponent;
  let fixture: ComponentFixture<ScorebordSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
