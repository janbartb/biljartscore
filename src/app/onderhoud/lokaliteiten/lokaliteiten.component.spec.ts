import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LokaliteitenComponent } from './lokaliteiten.component';

describe('LokaliteitenComponent', () => {
  let component: LokaliteitenComponent;
  let fixture: ComponentFixture<LokaliteitenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LokaliteitenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LokaliteitenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
