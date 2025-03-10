import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WedSpeler } from '../../../../model/wedstrijd';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-wed-score-speler',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './wed-score-speler.component.html',
    styleUrl: './wed-score-speler.component.css'
})
export class WedScoreSpelerComponent {
    @Input() speler: WedSpeler = new WedSpeler(-1);
    @Input() grijs: boolean = false;
    @Output() undoBusy: EventEmitter<boolean> = new EventEmitter<boolean>();

    balClicked() {
        this.undoBusy.emit(true);
    }
}
