import { Component, Input, OnInit } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { GetalComponent } from '../../getal/getal.component';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-scorebord-speler-landscape',
    standalone: true,
    imports: [
        GetalComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './scorebord-speler-landscape.component.html',
    styleUrl: './scorebord-speler-landscape.component.css'
})
export class ScorebordSpelerLandscapeComponent implements OnInit {
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() maxBrt: number = 0;
    @Input() showPunten: boolean = false;
    @Input() oldPunten: number = 0;
    @Input() wedOver: boolean = false;
    @Input() balWissel: boolean = false;
    @Input() border: string = 'bss-border';

    maxCijfersCar: number = 3;
    maxCijfersBrt: number = 3;
    maxCijfersSer: number = 3;

    ngOnInit(): void {
        if (this.speler.splTsCar > 0) {
            this.maxCijfersCar = this.maxCijfersSer = ('' + this.speler.splTsCar).length;
        }
        if (this.maxBrt > 0) {
            this.maxCijfersBrt = ('' + this.maxBrt).length;
        }
    }
}
