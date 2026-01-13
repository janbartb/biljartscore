import { Component, Input } from '@angular/core';
import { Wedstrijd } from '../../../model/wedstrijd';
import { ScoreTeamComponent } from '../score-team/score-team.component';
import { ScoreWedSpel2Component } from '../score-wed-spel2/score-wed-spel2.component';

@Component({
    selector: 'app-score-wed-team2',
    standalone: true,
    imports: [
        ScoreTeamComponent,
        ScoreWedSpel2Component
    ],
    templateUrl: './score-wed-team2.component.html',
    styleUrl: './score-wed-team2.component.css'
})
export class ScoreWedTeam2Component {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
}
