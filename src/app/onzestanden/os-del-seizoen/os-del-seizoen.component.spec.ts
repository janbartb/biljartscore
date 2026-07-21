import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsDelSeizoenComponent } from './os-del-seizoen.component';

describe('OsDelSeizoenComponent', () => {
  let component: OsDelSeizoenComponent;
  let fixture: ComponentFixture<OsDelSeizoenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsDelSeizoenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsDelSeizoenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
