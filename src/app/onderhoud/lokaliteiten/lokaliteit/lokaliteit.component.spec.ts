import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LokaliteitComponent } from './lokaliteit.component';

describe('LokaliteitComponent', () => {
  let component: LokaliteitComponent;
  let fixture: ComponentFixture<LokaliteitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LokaliteitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LokaliteitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
