import { DecimalPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WedSpeler } from '../../../../model/wedstrijd';

@Component({
    selector: 'app-wed-score-speler-landscape',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './wed-score-speler-landscape.component.html',
    styleUrl: './wed-score-speler-landscape.component.css'
})
export class WedScoreSpelerLandscapeComponent {
    @Input() speler: WedSpeler = new WedSpeler(-1);
    @Output() undoBusy: EventEmitter<boolean> = new EventEmitter<boolean>();

    balClicked() {
        this.undoBusy.emit(true);
    }
}
