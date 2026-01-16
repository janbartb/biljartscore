import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonWedTeam2Component } from './annon-wed-team2.component';

describe('AnnonWedTeam2Component', () => {
  let component: AnnonWedTeam2Component;
  let fixture: ComponentFixture<AnnonWedTeam2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonWedTeam2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonWedTeam2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
