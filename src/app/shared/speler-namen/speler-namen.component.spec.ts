import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpelerNamenComponent } from './speler-namen.component';

describe('SpelerNamenComponent', () => {
  let component: SpelerNamenComponent;
  let fixture: ComponentFixture<SpelerNamenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpelerNamenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpelerNamenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
