import { Component, effect, EventEmitter, input, Input, Output } from '@angular/core';
import { OefWedTeam } from '../../../../model/oef-wedstrijd';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-wed-score-team',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './wed-score-team.component.html',
    styleUrl: './wed-score-team.component.css'
})
export class WedScoreTeamComponent {
    @Input() team: OefWedTeam = new OefWedTeam(-1, '');
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
