import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieScorebordComponent } from './eigen-competitie-scorebord.component';

describe('EigenCompetitieScorebordComponent', () => {
  let component: EigenCompetitieScorebordComponent;
  let fixture: ComponentFixture<EigenCompetitieScorebordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieScorebordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieScorebordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
