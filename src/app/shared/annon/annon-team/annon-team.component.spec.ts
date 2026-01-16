import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonTeamComponent } from './annon-team.component';

describe('AnnonTeamComponent', () => {
  let component: AnnonTeamComponent;
  let fixture: ComponentFixture<AnnonTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnonTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
