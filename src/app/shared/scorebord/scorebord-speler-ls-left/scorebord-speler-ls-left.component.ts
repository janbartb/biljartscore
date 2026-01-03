import { Component, Input } from '@angular/core';
import { GetalVarComponent } from '../../getal-var/getal-var.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { WedSpeler } from '../../../model/wedstrijd';

@Component({
    selector: 'app-scorebord-speler-ls-left',
    standalone: true,
    imports: [
        GetalVarComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './scorebord-speler-ls-left.component.html',
    styleUrl: './scorebord-speler-ls-left.component.css'
})
export class ScorebordSpelerLsLeftComponent {
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
