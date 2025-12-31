import { Component, Input } from '@angular/core';
import { GetalComponent } from '../../getal/getal.component';
import { GetalVarComponent } from '../../getal-var/getal-var.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { WedSpeler } from '../../../model/wedstrijd';

@Component({
    selector: 'app-scorebord-speler-left',
    standalone: true,
    imports: [
        GetalComponent,
        GetalVarComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './scorebord-speler-left.component.html',
    styleUrl: './scorebord-speler-left.component.css'
})
export class ScorebordSpelerLeftComponent {
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() maxBrt: number = 0;
    @Input() teamCar: number = 0;
    @Input() showPunten: boolean = false;
    @Input() oldPunten: number = 0;
    @Input() wedOver: boolean = false;
    @Input() border: string = 'bss-border2';

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
