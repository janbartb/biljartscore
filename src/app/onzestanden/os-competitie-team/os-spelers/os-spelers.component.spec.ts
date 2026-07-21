import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsSpelersComponent } from './os-spelers.component';

describe('OsSpelersComponent', () => {
  let component: OsSpelersComponent;
  let fixture: ComponentFixture<OsSpelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsSpelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsSpelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
