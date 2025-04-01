import { DecimalPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CmpMatchSpeler, CmpSpeler } from '../../../../../model/competitie';

@Component({
    selector: 'app-eigen-competitie-score-speler',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './eigen-competitie-score-speler.component.html',
    styleUrl: './eigen-competitie-score-speler.component.css'
})
export class EigenCompetitieScoreSpelerComponent {
    @Input() speler: CmpMatchSpeler = new CmpMatchSpeler(new CmpSpeler(1), true);
    @Input() oldPunten: number = 0;
    @Input() showPunten: boolean = false;
    @Input() matchOver: boolean = false;
    @Output() undoBusy: EventEmitter<boolean> = new EventEmitter<boolean>();

    balClicked() {
        this.undoBusy.emit(true);
    }
}
