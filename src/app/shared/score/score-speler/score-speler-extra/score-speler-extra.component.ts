import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { WedSpelerStand } from '../../../../model/wedstrijd';

@Component({
    selector: 'app-score-speler-extra',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './score-speler-extra.component.html',
    styleUrl: './score-speler-extra.component.css'
})
export class ScoreSpelerExtraComponent {
    @Input() showPunten: boolean = false;
    @Input() wedOver: boolean = false;
    @Input() tsMoy: number = 0;
    @Input() stand: WedSpelerStand = new WedSpelerStand();
    @Input() oldPunten: number = 0;
}
