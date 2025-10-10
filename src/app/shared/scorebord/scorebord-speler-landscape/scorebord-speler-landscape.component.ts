import { Component, Input, OnInit } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { GetalComponent } from '../../getal/getal.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { GetalVarComponent } from '../../getal-var/getal-var.component';

@Component({
    selector: 'app-scorebord-speler-landscape',
    standalone: true,
    imports: [
        GetalComponent,
        GetalVarComponent,
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

    formatCar: string = '009';
    formatBrt: string = '009';
    formatSer: string = '009';

    ngOnInit(): void {
        if (this.speler.splTsCar > 0) {
            if (this.speler.splTsCar < 100) {
                this.formatCar = this.formatSer = '09';
            }
        }
        if (this.maxBrt > 0) {
            if (this.maxBrt < 100) {
                this.formatBrt = '09';
            }
        }
    }
}
