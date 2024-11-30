import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedLijstComponent } from './wed-lijst.component';

describe('WedLijstComponent', () => {
  let component: WedLijstComponent;
  let fixture: ComponentFixture<WedLijstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedLijstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedLijstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
