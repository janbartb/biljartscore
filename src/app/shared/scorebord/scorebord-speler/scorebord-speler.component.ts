import { Component, Input, OnInit } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { DecimalPipe, NgClass } from '@angular/common';
import { GetalComponent } from '../../getal/getal.component';
import { GetalHeelComponent } from "../../getal-heel/getal-heel.component";

@Component({
    selector: 'app-scorebord-speler',
    standalone: true,
    imports: [
        GetalComponent,
        DecimalPipe,
        NgClass,
        GetalHeelComponent
],
    templateUrl: './scorebord-speler.component.html',
    styleUrl: './scorebord-speler.component.css'
})
export class ScorebordSpelerComponent implements OnInit {
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() maxBrt: number = 0;
    @Input() teamCar: number = 0;
    @Input() showPunten: boolean = false;
    @Input() oldPunten: number = 0;
    @Input() wedOver: boolean = false;
    @Input() border: string = 'bss-border';

    maxCijfersCar: number = 3;
    maxCijfersBrt: number = 3;
    maxCijfersSer: number = 3;

    ngOnInit(): void {
        if (this.speler.splTsCar > 0 || this.teamCar > 0) {
            const tsCar = (this.teamCar > 0) ? this.teamCar : this.speler.splTsCar;
            this.maxCijfersCar = this.maxCijfersSer = ('' + tsCar).length;
        }
        if (this.maxBrt > 0) {
            this.maxCijfersBrt = ('' + this.maxBrt).length;
        }
    }
}
