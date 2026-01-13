import { Component, Input } from '@angular/core';
import { ScoreSpelerWideComponent } from '../score-speler-wide/score-speler-wide.component';
import { Wedstrijd } from '../../../model/wedstrijd';

@Component({
    selector: 'app-score-wed-spel1',
    standalone: true,
    imports: [
        ScoreSpelerWideComponent
    ],
    templateUrl: './score-wed-spel1.component.html',
    styleUrl: './score-wed-spel1.component.css'
})
export class ScoreWedSpel1Component {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();

}
