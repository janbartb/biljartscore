import { DecimalPipe, NgClass } from '@angular/common';
import { Component, effect, EventEmitter, input, Input, Output } from '@angular/core';
import { MatchSpeler } from '../../../../model/match';

@Component({
    selector: 'app-knbb-team-match-score-speler',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './knbb-team-match-score-speler.component.html',
    styleUrl: './knbb-team-match-score-speler.component.css'
})
export class KnbbTeamMatchScoreSpelerComponent {
    @Input() speler: MatchSpeler = new MatchSpeler();
    @Input() teamIdx: number = 0;
    @Input() oldPunten: number = 0;
    cars = input(0);
    carsView: number = 0;
    brtn = input(0);
    brtnView: number = 0;
    ser = input(0);
    serView: number = 0;
    @Output() undoBusy: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() spelerClicked: EventEmitter<MatchSpeler> = new EventEmitter<MatchSpeler>();
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

    naamClicked() {
        this.spelerClicked.emit(this.speler);
    }
}
