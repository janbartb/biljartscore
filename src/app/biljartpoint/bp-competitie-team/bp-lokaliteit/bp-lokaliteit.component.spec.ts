import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpLokaliteitComponent } from './bp-lokaliteit.component';

describe('BpLokaliteitComponent', () => {
  let component: BpLokaliteitComponent;
  let fixture: ComponentFixture<BpLokaliteitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpLokaliteitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpLokaliteitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
