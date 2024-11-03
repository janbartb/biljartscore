import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoyenneTabelEditComponent } from './moyenne-tabel-edit.component';

describe('MoyenneTabelEditComponent', () => {
  let component: MoyenneTabelEditComponent;
  let fixture: ComponentFixture<MoyenneTabelEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoyenneTabelEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoyenneTabelEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
