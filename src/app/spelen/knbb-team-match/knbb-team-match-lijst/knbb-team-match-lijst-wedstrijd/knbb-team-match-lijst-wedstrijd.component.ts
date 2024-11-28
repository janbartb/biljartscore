import { Component, Input, OnInit } from '@angular/core';
import { MatchSpeler } from '../../../../model/match';
import { ScoreBeurt } from '../../../../model/score-beurt';
import { KnbbTeamMatchLijstSpelerComponent } from '../knbb-team-match-lijst-speler/knbb-team-match-lijst-speler.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-knbb-team-match-lijst-wedstrijd',
    standalone: true,
    imports: [
        KnbbTeamMatchLijstSpelerComponent,
        NgClass
    ],
    templateUrl: './knbb-team-match-lijst-wedstrijd.component.html',
    styleUrl: './knbb-team-match-lijst-wedstrijd.component.css'
})
export class KnbbTeamMatchLijstWedstrijdComponent implements OnInit {
    @Input() spl: MatchSpeler = new MatchSpeler();
    @Input() teg: MatchSpeler = new MatchSpeler();
    @Input() wedNr: number = 0;
    @Input() gameOver: boolean = false;
    @Input() maxBrt: number = 0;
    lijsten: ScoreBeurt[][] = [];
    colorClass: string = 'clr-red';

    fillScoreLijsten(): void {
        let lijstLength = this.maxBrt > 60 ? 100 : 60;
        // speler
        let lijstSpl: ScoreBeurt[] = [];
        let totaal = 0;
        for (let i = 0; i < lijstLength; i++) {
            let item = new ScoreBeurt();
            if (i < this.spl.stand.score.length) {
                item.gespeeld = true;
                item.serie = this.spl.stand.score[i];
                item.origSerie = item.serie;
                totaal += item.serie;
                item.totaal = totaal;
            }
            else {
                item.verberg = i >= this.maxBrt;
            }
            lijstSpl.push(item);
        }
        this.lijsten.push(lijstSpl);
        // tegenstander
        let lijstTeg: ScoreBeurt[] = [];
        totaal = 0;
        for (let i = 0; i < lijstLength; i++) {
            let item = new ScoreBeurt();
            if (i < this.teg.stand.score.length) {
                item.gespeeld = true;
                item.serie = this.teg.stand.score[i];
                item.origSerie = item.serie;
                totaal += item.serie;
                item.totaal = totaal;
            }
            else {
                item.verberg = i >= this.maxBrt;
            }
            lijstTeg.push(item);
        }
        this.lijsten.push(lijstTeg);
    }

    ngOnInit(): void {
        this.fillScoreLijsten();
        if (!this.gameOver) {
            this.colorClass = this.lijsten[0][0].gespeeld ? 'clr-org' : 'clr-grn';
        }
    }
}
