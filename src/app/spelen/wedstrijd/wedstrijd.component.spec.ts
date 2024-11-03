import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedstrijdComponent } from './wedstrijd.component';

describe('WedstrijdComponent', () => {
  let component: WedstrijdComponent;
  let fixture: ComponentFixture<WedstrijdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedstrijdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedstrijdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
