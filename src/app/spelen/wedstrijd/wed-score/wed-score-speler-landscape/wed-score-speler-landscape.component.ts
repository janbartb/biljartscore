import { DecimalPipe, NgClass } from '@angular/common';
import { Component, effect, EventEmitter, input, Input, Output } from '@angular/core';
import { OefWedSpeler } from '../../../../model/oef-wedstrijd';

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
    @Input() speler: OefWedSpeler = new OefWedSpeler(-1);
    cars = input(0);
    carsView: number = 0;
    brtn = input(0);
    brtnView: number = 0;
    ser = input(0);
    serView: number = 0;
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
