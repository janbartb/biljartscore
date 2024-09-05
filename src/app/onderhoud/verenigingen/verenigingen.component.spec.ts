import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerenigingenComponent } from './verenigingen.component';

describe('VerenigingenComponent', () => {
  let component: VerenigingenComponent;
  let fixture: ComponentFixture<VerenigingenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerenigingenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerenigingenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
