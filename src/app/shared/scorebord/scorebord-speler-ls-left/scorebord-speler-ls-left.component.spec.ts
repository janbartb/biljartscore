import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordSpelerLsLeftComponent } from './scorebord-speler-ls-left.component';

describe('ScorebordSpelerLsLeftComponent', () => {
  let component: ScorebordSpelerLsLeftComponent;
  let fixture: ComponentFixture<ScorebordSpelerLsLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordSpelerLsLeftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordSpelerLsLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
