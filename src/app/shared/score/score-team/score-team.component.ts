import { Component, Input, OnInit } from '@angular/core';
import { WedTeam } from '../../../model/wedstrijd';
import { ScoreWideInfoComponent } from '../score-wide/score-wide-info/score-wide-info.component';
import { ScoreWideStandComponent } from '../score-wide/score-wide-stand/score-wide-stand.component';
import { ScoreWideVoortgangComponent } from '../score-wide/score-wide-voortgang/score-wide-voortgang.component';
import { ScoreWideLaatste5Component } from '../score-wide/score-wide-laatste5/score-wide-laatste5.component';
import { ScoreWideBalComponent } from '../score-wide/score-wide-bal/score-wide-bal.component';
import { ScoreWideExtraComponent } from '../score-wide/score-wide-extra/score-wide-extra.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-score-team',
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
    templateUrl: './score-team.component.html',
    styleUrl: './score-team.component.css'
})
export class ScoreTeamComponent implements OnInit {
    @Input() team: WedTeam = new WedTeam();
    @Input() maxBrt: number = 0;
    @Input() position: string = 'left';

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
