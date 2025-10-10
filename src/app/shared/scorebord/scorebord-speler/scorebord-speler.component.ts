import { Component, Input, OnInit } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { DecimalPipe, NgClass } from '@angular/common';
import { GetalComponent } from '../../getal/getal.component';
import { GetalVarComponent } from '../../getal-var/getal-var.component';

@Component({
    selector: 'app-scorebord-speler',
    standalone: true,
    imports: [
        GetalComponent,
        GetalVarComponent,
        DecimalPipe,
        NgClass
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

    formatCar: string = '009';
    formatBrt: string = '009';
    formatSer: string = '009';

    ngOnInit(): void {
        if (this.speler.splTsCar > 0 || this.teamCar > 0) {
            const tsCar = (this.teamCar > 0) ? this.teamCar : this.speler.splTsCar;
            if (tsCar < 100) {
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
