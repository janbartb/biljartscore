import { Component, Input } from '@angular/core';
import { WedSpeler, Wedstrijd } from '../../../model/wedstrijd';
import { ScoreSpelerComponent } from '../score-speler/score-speler.component';

@Component({
    selector: 'app-score-wed-spel2',
    standalone: true,
    imports: [
        ScoreSpelerComponent
    ],
    templateUrl: './score-wed-spel2.component.html',
    styleUrl: './score-wed-spel2.component.css'
})
export class ScoreWedSpel2Component {
    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() tegenstander: WedSpeler = new WedSpeler();
    @Input() oldPunten: number[] = [0, 0];
}
