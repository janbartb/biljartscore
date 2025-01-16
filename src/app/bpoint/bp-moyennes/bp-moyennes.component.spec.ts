import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpMoyennesComponent } from './bp-moyennes.component';

describe('BpMoyennesComponent', () => {
  let component: BpMoyennesComponent;
  let fixture: ComponentFixture<BpMoyennesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpMoyennesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpMoyennesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
