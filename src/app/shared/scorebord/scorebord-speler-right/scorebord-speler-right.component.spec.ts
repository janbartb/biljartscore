import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordSpelerRightComponent } from './scorebord-speler-right.component';

describe('ScorebordSpelerRightComponent', () => {
  let component: ScorebordSpelerRightComponent;
  let fixture: ComponentFixture<ScorebordSpelerRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordSpelerRightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordSpelerRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
