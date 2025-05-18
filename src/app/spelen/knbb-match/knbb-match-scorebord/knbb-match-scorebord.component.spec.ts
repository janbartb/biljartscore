import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnbbMatchScorebordComponent } from './knbb-match-scorebord.component';

describe('KnbbMatchScorebordComponent', () => {
  let component: KnbbMatchScorebordComponent;
  let fixture: ComponentFixture<KnbbMatchScorebordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnbbMatchScorebordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnbbMatchScorebordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
