import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchCompComponent } from './knbb-match-comp.component';

describe('KnbbMatchCompComponent', () => {
  let component: KnbbMatchCompComponent;
  let fixture: ComponentFixture<KnbbMatchCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchCompComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
