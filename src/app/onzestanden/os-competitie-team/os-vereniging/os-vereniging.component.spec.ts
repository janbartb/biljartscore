import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OsVerenigingComponent } from './os-vereniging.component';

describe('OsVerenigingComponent', () => {
  let component: OsVerenigingComponent;
  let fixture: ComponentFixture<OsVerenigingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsVerenigingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OsVerenigingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
