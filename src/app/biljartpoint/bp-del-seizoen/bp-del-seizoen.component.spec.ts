import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpDelSeizoenComponent } from './bp-del-seizoen.component';

describe('BpDelSeizoenComponent', () => {
  let component: BpDelSeizoenComponent;
  let fixture: ComponentFixture<BpDelSeizoenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpDelSeizoenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpDelSeizoenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
