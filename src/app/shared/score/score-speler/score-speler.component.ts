import { Component, inject, Input, OnInit } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { NgClass } from '@angular/common';
import { ScoreSpelerInfoComponent } from './score-speler-info/score-speler-info.component';
import { ScoreSpelerStandComponent } from './score-speler-stand/score-speler-stand.component';
import { ScoreSpelerLaatste5Component } from './score-speler-laatste5/score-speler-laatste5.component';
import { ScoreSpelerExtraComponent } from "./score-speler-extra/score-speler-extra.component";
import { ScoreSpelerVoortgangComponent } from './score-speler-voortgang/score-speler-voortgang.component';
import { StatusService } from '../../../services/status.service';

@Component({
    selector: 'app-score-speler',
    standalone: true,
    imports: [
        ScoreSpelerInfoComponent,
        ScoreSpelerStandComponent,
        ScoreSpelerLaatste5Component,
        ScoreSpelerExtraComponent,
        ScoreSpelerVoortgangComponent,
        NgClass
    ],
    templateUrl: './score-speler.component.html',
    styleUrl: './score-speler.component.css'
})
export class ScoreSpelerComponent implements OnInit {
    appData = inject(StatusService);
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() maxBrt: number = 0;
    @Input() teamCar: number = 0;
    @Input() showPunten: boolean = false;
    @Input() oldPunten: number = 0;
    @Input() wedOver: boolean = false;
    @Input() position: string = 'left';
    meteenToev: boolean = false;

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
        this.meteenToev = this.appData.isCarMeteenToevoegen();
    }

}
