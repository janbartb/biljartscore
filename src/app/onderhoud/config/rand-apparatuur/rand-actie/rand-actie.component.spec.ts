import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandActieComponent } from './rand-actie.component';

describe('RandActieComponent', () => {
  let component: RandActieComponent;
  let fixture: ComponentFixture<RandActieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandActieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RandActieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
