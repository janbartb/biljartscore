import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchComponent } from './knbb-match.component';

describe('KnbbMatchComponent', () => {
  let component: KnbbMatchComponent;
  let fixture: ComponentFixture<KnbbMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
