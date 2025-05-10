import { DecimalPipe, NgClass } from '@angular/common';
import { Component, effect, EventEmitter, input, Input, InputSignal, Output } from '@angular/core';
import { CmpMatchSpeler, CmpSpeler } from '../../../../../model/competitie';
import { defaultEquals } from '@angular/core/primitives/signals';

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
    cars = input(0);
    carsView: number = 0;
    @Input() oldPunten: number = 0;
    @Input() showPunten: boolean = false;
    @Input() matchOver: boolean = false;
    @Output() undoBusy: EventEmitter<boolean> = new EventEmitter<boolean>();
    cssClass: string = '';

    constructor() {
        this.carsView = this.cars();
        effect(() => {
            const temp = this.cars();
            setTimeout(() => {
                this.cssClass = 'carsHidden';
                setTimeout(() => {
                    this.carsView = this.cars();
                    this.cssClass = '';
                }, 800);                                        
            }, 250);
        });
    }

    balClicked() {
        this.undoBusy.emit(true);
    }
}
