import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionFooterBtnsComponent } from './section-footer-btns.component';

describe('SectionFooterBtnsComponent', () => {
  let component: SectionFooterBtnsComponent;
  let fixture: ComponentFixture<SectionFooterBtnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionFooterBtnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionFooterBtnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
