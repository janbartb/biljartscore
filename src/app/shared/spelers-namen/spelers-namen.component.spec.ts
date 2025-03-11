import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpelersNamenComponent } from './spelers-namen.component';

describe('SpelersNamenComponent', () => {
  let component: SpelersNamenComponent;
  let fixture: ComponentFixture<SpelersNamenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpelersNamenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpelersNamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
