import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoyenneTabellenComponent } from './moyenne-tabellen.component';

describe('MoyenneTabellenComponent', () => {
  let component: MoyenneTabellenComponent;
  let fixture: ComponentFixture<MoyenneTabellenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoyenneTabellenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoyenneTabellenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
