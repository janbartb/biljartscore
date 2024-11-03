import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoyenneTabelComponent } from './moyenne-tabel.component';

describe('MoyenneTabelComponent', () => {
  let component: MoyenneTabelComponent;
  let fixture: ComponentFixture<MoyenneTabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoyenneTabelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoyenneTabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
