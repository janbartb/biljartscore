import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieLijstComponent } from './eigen-competitie-lijst.component';

describe('EigenCompetitieLijstComponent', () => {
  let component: EigenCompetitieLijstComponent;
  let fixture: ComponentFixture<EigenCompetitieLijstComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieLijstComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieLijstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
