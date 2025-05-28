import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonScorebordComponent } from './annon-scorebord.component';

describe('AnnonScorebordComponent', () => {
  let component: AnnonScorebordComponent;
  let fixture: ComponentFixture<AnnonScorebordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonScorebordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonScorebordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
