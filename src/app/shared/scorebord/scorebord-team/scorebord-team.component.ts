import { Component, Input, OnInit } from '@angular/core';
import { WedTeam } from '../../../model/wedstrijd';
import { DecimalPipe, NgClass } from '@angular/common';
import { GetalVarComponent } from '../../getal-var/getal-var.component';

@Component({
    selector: 'app-scorebord-team',
    standalone: true,
    imports: [
        GetalVarComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './scorebord-team.component.html',
    styleUrl: './scorebord-team.component.css'
})
export class ScorebordTeamComponent implements OnInit {
    @Input() team: WedTeam = new WedTeam();
    @Input() maxBrt: number = 0;
    @Input() showPunten: boolean = false;
    @Input() oldPunten: number = 0;
    @Input() wedOver: boolean = false;
    @Input() border: string = 'bss-border';

    formatCar: string = '009';
    formatBrt: string = '009';
    formatSer: string = '009';

    ngOnInit(): void {
        if (this.team.teamTsCar > 0) {
            if (this.team.teamTsCar < 100) {
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
