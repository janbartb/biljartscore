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
    brtn = input(0);
    brtnView: number = 0;
    ser = input(0);
    serView: number = 0;
    @Input() oldPunten: number = 0;
    @Input() showPunten: boolean = false;
    @Input() matchOver: boolean = false;
    @Output() undoBusy: EventEmitter<boolean> = new EventEmitter<boolean>();
    cssClassCars: string = '';
    cssClassBrtn: string = '';
    cssClassSer: string = '';

    constructor() {
        this.carsView = this.cars();
        this.brtnView = this.brtn();
        this.serView = this.ser();
        effect(() => {
            const c = this.cars();
            setTimeout(() => {
                this.cssClassCars = 'carsHidden';
                setTimeout(() => {
                    this.carsView = this.cars();
                    this.cssClassCars = '';
                }, 800);                                        
            }, 250);
        });
        effect(() => {
            const b = this.brtn();
            setTimeout(() => {
                this.cssClassBrtn = 'brtnHidden';
                setTimeout(() => {
                    this.brtnView = this.brtn();
                    this.cssClassBrtn = '';
                }, 800);                                        
            }, 250);
        });
        effect(() => {
            const s = this.ser();
            setTimeout(() => {
                this.cssClassSer = 'serHidden';
                setTimeout(() => {
                    this.serView = this.ser();
                    this.cssClassSer = '';
                }, 800);                                        
            }, 250);
        });
    }

    balClicked() {
        this.undoBusy.emit(true);
    }
}
