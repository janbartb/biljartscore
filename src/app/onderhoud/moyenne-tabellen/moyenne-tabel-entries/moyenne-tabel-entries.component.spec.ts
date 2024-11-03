import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoyenneTabelEntriesComponent } from './moyenne-tabel-entries.component';

describe('MoyenneTabelEntriesComponent', () => {
  let component: MoyenneTabelEntriesComponent;
  let fixture: ComponentFixture<MoyenneTabelEntriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoyenneTabelEntriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoyenneTabelEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
