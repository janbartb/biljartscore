import { Component, Input } from '@angular/core';
import { Wedstrijd } from '../../../model/wedstrijd';
import { ScoreSpelerWideComponent } from '../score-speler-wide/score-speler-wide.component';

@Component({
    selector: 'app-score-wed-spel3',
    standalone: true,
    imports: [
        ScoreSpelerWideComponent
    ],
    templateUrl: './score-wed-spel3.component.html',
    styleUrl: './score-wed-spel3.component.css'
})
export class ScoreWedSpel3Component {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
}
