import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedConfigComponent } from './wed-config.component';

describe('WedConfigComponent', () => {
  let component: WedConfigComponent;
  let fixture: ComponentFixture<WedConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
