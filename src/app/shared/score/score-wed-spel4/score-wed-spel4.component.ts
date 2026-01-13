import { Component, Input } from '@angular/core';
import { ScoreSpelerWideComponent } from '../score-speler-wide/score-speler-wide.component';
import { Wedstrijd } from '../../../model/wedstrijd';

@Component({
    selector: 'app-score-wed-spel4',
    standalone: true,
    imports: [
        ScoreSpelerWideComponent
    ],
    templateUrl: './score-wed-spel4.component.html',
    styleUrl: './score-wed-spel4.component.css'
})
export class ScoreWedSpel4Component {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
}
