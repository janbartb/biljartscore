import { Component, Input, OnInit } from '@angular/core';
import { MatchTeam, MatchTeamTotalen, TeamMatch } from '../../../model/match';
import { KnbbTeamMatchSpelerComponent } from '../knbb-team-match-speler/knbb-team-match-speler.component';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-knbb-team-match-team',
    standalone: true,
    imports: [
        KnbbTeamMatchSpelerComponent,
        NgClass,
        DecimalPipe
    ],
    templateUrl: './knbb-team-match-team.component.html',
    styleUrl: './knbb-team-match-team.component.css'
})
export class KnbbTeamMatchTeamComponent implements OnInit {
    @Input() match: TeamMatch = new TeamMatch();
    @Input() idx: number = 0;
    @Input() status: number[] = [];
    team: MatchTeam = new MatchTeam();
    teg: MatchTeam = new MatchTeam();
    totalen: MatchTeamTotalen = new MatchTeamTotalen();
    tegPunten: number = 0;

    berekenTotalen(): void {
        this.totalen.tsCar = this.team.spelers[0].splTsCar + this.team.spelers[1].splTsCar + this.team.spelers[2].splTsCar;
        this.totalen.aantCar = this.team.spelers[0].stand.aantCar + this.team.spelers[1].stand.aantCar + this.team.spelers[2].stand.aantCar;
        this.totalen.percentage = 100 * this.totalen.aantCar / this.totalen.tsCar;
        this.totalen.aantBrt = this.team.spelers[0].stand.aantBrt + this.team.spelers[1].stand.aantBrt + this.team.spelers[2].stand.aantBrt;
        this.totalen.gemiddelde = (this.totalen.aantBrt == 0) ? 0 : this.totalen.aantCar / this.totalen.aantBrt;
        this.totalen.punten = this.team.spelers[0].stand.punten + this.team.spelers[1].stand.punten + this.team.spelers[2].stand.punten;
        this.totalen.hoogSer = Math.max(this.team.spelers[0].stand.hoogSer, this.team.spelers[1].stand.hoogSer, this.team.spelers[2].stand.hoogSer);
        const tegTsCar = this.teg.spelers[0].splTsCar + this.teg.spelers[1].splTsCar + this.teg.spelers[2].splTsCar;
        const tegCar = this.teg.spelers[0].stand.aantCar + this.teg.spelers[1].stand.aantCar + this.teg.spelers[2].stand.aantCar;
        const team2Brt = this.match.teams[1].spelers[0].stand.aantBrt + this.match.teams[1].spelers[1].stand.aantBrt + this.match.teams[1].spelers[2].stand.aantBrt;
        const tegPerc = 100 * tegCar / tegTsCar;
        this.tegPunten = this.teg.spelers[0].stand.punten + this.teg.spelers[1].stand.punten + this.teg.spelers[2].stand.punten;
        this.totalen.teamPunten = 0;
        let tegTeamPunten = 0;
        if (team2Brt > 0) {
            if (this.totalen.percentage === tegPerc) {
                this.totalen.teamPunten = 1;
                tegTeamPunten = 1;
            }
            else {
                if (this.totalen.percentage < tegPerc) {
                    this.totalen.teamPunten = 0;
                    tegTeamPunten = 2;
                }
                else {
                    this.totalen.teamPunten = 2;
                    tegTeamPunten = 0;
                }
            }
        }
        this.totalen.punten += this.totalen.teamPunten;
        this.tegPunten += tegTeamPunten;
    }

    ngOnInit(): void {
        this.team = this.match.teams[this.idx];
        this.teg = this.match.teams[Math.abs(this.idx - 1)];
        this.berekenTotalen();
    }
}
