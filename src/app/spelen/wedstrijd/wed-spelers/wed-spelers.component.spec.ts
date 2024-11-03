import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedSpelersComponent } from './wed-spelers.component';

describe('WedSpelersComponent', () => {
  let component: WedSpelersComponent;
  let fixture: ComponentFixture<WedSpelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedSpelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedSpelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
