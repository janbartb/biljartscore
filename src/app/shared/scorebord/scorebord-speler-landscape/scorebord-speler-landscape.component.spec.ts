import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordSpelerLandscapeComponent } from './scorebord-speler-landscape.component';

describe('ScorebordSpelerLandscapeComponent', () => {
  let component: ScorebordSpelerLandscapeComponent;
  let fixture: ComponentFixture<ScorebordSpelerLandscapeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordSpelerLandscapeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordSpelerLandscapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
