import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchLijstComponent } from './knbb-match-lijst.component';

describe('KnbbMatchLijstComponent', () => {
  let component: KnbbMatchLijstComponent;
  let fixture: ComponentFixture<KnbbMatchLijstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchLijstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchLijstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
