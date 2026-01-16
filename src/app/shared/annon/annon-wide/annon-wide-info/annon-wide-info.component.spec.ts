import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonWideInfoComponent } from './annon-wide-info.component';

describe('AnnonWideInfoComponent', () => {
  let component: AnnonWideInfoComponent;
  let fixture: ComponentFixture<AnnonWideInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonWideInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonWideInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
