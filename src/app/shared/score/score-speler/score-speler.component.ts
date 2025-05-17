import { Component, Input } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { NgClass } from '@angular/common';
import { ScoreSpelerSpelerComponent } from './score-speler-speler/score-speler-speler.component';
import { ScoreSpelerScoreComponent } from './score-speler-score/score-speler-score.component';
import { ScoreSpelerLaatsteComponent } from './score-speler-laatste/score-speler-laatste.component';
import { ScoreSpelerExtraComponent } from './score-speler-extra/score-speler-extra.component';

@Component({
    selector: 'app-score-speler',
    standalone: true,
    imports: [
        ScoreSpelerSpelerComponent,
        ScoreSpelerScoreComponent,
        ScoreSpelerLaatsteComponent,
        ScoreSpelerExtraComponent,
        NgClass
    ],
    templateUrl: './score-speler.component.html',
    styleUrl: './score-speler.component.css'
})
export class ScoreSpelerComponent {
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() grijs: boolean = false;
    @Input() showPunten: boolean = false;
    @Input() oldPunten: number = 0;
    @Input() wedOver: boolean = false;
}
