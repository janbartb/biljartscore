import { Component, Input, OnInit } from '@angular/core';
import { WedTeam } from '../../../model/wedstrijd';
import { GetalComponent } from '../../getal/getal.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { GetalHeelComponent } from '../../getal-heel/getal-heel.component';

@Component({
    selector: 'app-scorebord-team',
    standalone: true,
    imports: [
        GetalComponent,
        GetalHeelComponent,
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

    maxCijfersCar: number = 3;
    maxCijfersBrt: number = 3;
    maxCijfersSer: number = 3;

    ngOnInit(): void {
        if (this.team.teamTsCar > 0) {
            this.maxCijfersCar = this.maxCijfersSer = ('' + this.team.teamTsCar).length;
        }
        if (this.maxBrt > 0) {
            this.maxCijfersBrt = ('' + this.maxBrt).length;
        }
    }
}
