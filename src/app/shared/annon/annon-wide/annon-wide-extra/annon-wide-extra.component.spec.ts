import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonWideExtraComponent } from './annon-wide-extra.component';

describe('AnnonWideExtraComponent', () => {
  let component: AnnonWideExtraComponent;
  let fixture: ComponentFixture<AnnonWideExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonWideExtraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonWideExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
