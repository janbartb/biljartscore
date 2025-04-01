import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EigenCompetitieLijstSpelerComponent } from './eigen-competitie-lijst-speler.component';

describe('EigenCompetitieLijstSpelerComponent', () => {
  let component: EigenCompetitieLijstSpelerComponent;
  let fixture: ComponentFixture<EigenCompetitieLijstSpelerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EigenCompetitieLijstSpelerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EigenCompetitieLijstSpelerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
