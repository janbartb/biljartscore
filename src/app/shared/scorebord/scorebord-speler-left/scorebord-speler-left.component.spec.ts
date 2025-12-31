import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorebordSpelerLeftComponent } from './scorebord-speler-left.component';

describe('ScorebordSpelerLeftComponent', () => {
  let component: ScorebordSpelerLeftComponent;
  let fixture: ComponentFixture<ScorebordSpelerLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScorebordSpelerLeftComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScorebordSpelerLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
