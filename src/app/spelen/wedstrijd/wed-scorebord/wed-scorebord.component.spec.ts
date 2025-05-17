import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WedScorebordComponent } from './wed-scorebord.component';

describe('WedScorebordComponent', () => {
  let component: WedScorebordComponent;
  let fixture: ComponentFixture<WedScorebordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WedScorebordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WedScorebordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
