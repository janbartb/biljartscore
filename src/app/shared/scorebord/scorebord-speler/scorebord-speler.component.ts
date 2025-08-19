import { Component, Input, OnInit } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { DecimalPipe, NgClass } from '@angular/common';
import { GetalComponent } from '../../getal/getal.component';

@Component({
    selector: 'app-scorebord-speler',
    standalone: true,
    imports: [
        GetalComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './scorebord-speler.component.html',
    styleUrl: './scorebord-speler.component.css'
})
export class ScorebordSpelerComponent implements OnInit {
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() maxBrt: number = 0;
    @Input() showPunten: boolean = false;
    @Input() oldPunten: number = 0;
    @Input() wedOver: boolean = false;
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
