import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedAantSpelersComponent } from './wed-aant-spelers.component';

describe('WedAantSpelersComponent', () => {
  let component: WedAantSpelersComponent;
  let fixture: ComponentFixture<WedAantSpelersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedAantSpelersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedAantSpelersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
