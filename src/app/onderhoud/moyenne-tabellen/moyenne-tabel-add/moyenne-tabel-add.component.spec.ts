import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoyenneTabelAddComponent } from './moyenne-tabel-add.component';

describe('MoyenneTabelAddComponent', () => {
  let component: MoyenneTabelAddComponent;
  let fixture: ComponentFixture<MoyenneTabelAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoyenneTabelAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoyenneTabelAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
