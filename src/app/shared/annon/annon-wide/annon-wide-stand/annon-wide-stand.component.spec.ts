import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonWideStandComponent } from './annon-wide-stand.component';

describe('AnnonWideStandComponent', () => {
  let component: AnnonWideStandComponent;
  let fixture: ComponentFixture<AnnonWideStandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonWideStandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonWideStandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
