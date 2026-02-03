import { Component, inject, Input, OnInit } from '@angular/core';
import { WedSpeler } from '../../../model/wedstrijd';
import { NgClass } from '@angular/common';
import { ScoreWideInfoComponent } from '../score-wide/score-wide-info/score-wide-info.component';
import { ScoreWideStandComponent } from '../score-wide/score-wide-stand/score-wide-stand.component';
import { ScoreWideVoortgangComponent } from '../score-wide/score-wide-voortgang/score-wide-voortgang.component';
import { ScoreWideLaatste5Component } from "../score-wide/score-wide-laatste5/score-wide-laatste5.component";
import { ScoreWideBalComponent } from '../score-wide/score-wide-bal/score-wide-bal.component';
import { ScoreWideExtraComponent } from "../score-wide/score-wide-extra/score-wide-extra.component";
import { StatusService } from '../../../services/status.service';

@Component({
    selector: 'app-score-speler-wide',
    standalone: true,
    imports: [
        ScoreWideInfoComponent,
        ScoreWideStandComponent,
        ScoreWideVoortgangComponent,
        ScoreWideLaatste5Component,
        ScoreWideBalComponent,
        ScoreWideExtraComponent,
        NgClass
    ],
    templateUrl: './score-speler-wide.component.html',
    styleUrl: './score-speler-wide.component.css'
})
export class ScoreSpelerWideComponent implements OnInit {
    appData = inject(StatusService);
    @Input() speler: WedSpeler = new WedSpeler();
    @Input() maxBrt: number = 0;
    @Input() isVijfde: boolean = false;
    @Input() position: string = 'left';
    meteenToev: boolean = false;

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
        this.meteenToev = this.appData.isCarMeteenToevoegen();
    }
}
