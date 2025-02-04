import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BpSpelersComponent } from './bp-spelers.component';

describe('BpSpelersComponent', () => {
  let component: BpSpelersComponent;
  let fixture: ComponentFixture<BpSpelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BpSpelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BpSpelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
