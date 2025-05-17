import { DecimalPipe, NgClass } from '@angular/common';
import { Component, effect, Input, input } from '@angular/core';

@Component({
    selector: 'app-score-speler-score',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './score-speler-score.component.html',
    styleUrl: './score-speler-score.component.css'
})
export class ScoreSpelerScoreComponent {
    @Input() moy: number = 0;
    @Input() serie: number = 0;
    cars = input(0);
    carsView: number = 0;
    brtn = input(0);
    brtnView: number = 0;
    ser = input(0);
    serView: number = 0;
    
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
    
}
