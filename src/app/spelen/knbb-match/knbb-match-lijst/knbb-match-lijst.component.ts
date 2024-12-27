import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { Match, TeamMatch } from '../../../model/match';
import { LijstDimensies, ScoreBeurt, ScoreSpeler } from '../../../model/score-beurt';
import { WedLijstSpelerComponent } from '../../wedstrijd/wed-lijst/wed-lijst-speler/wed-lijst-speler.component';
import { KnbbMatchLijstSpelerComponent } from './knbb-match-lijst-speler/knbb-match-lijst-speler.component';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../../services/helper.service';

@Component({
    selector: 'app-knbb-match-lijst',
    standalone: true,
    imports: [
        KnbbMatchLijstSpelerComponent
    ],
    templateUrl: './knbb-match-lijst.component.html',
    styleUrl: './knbb-match-lijst.component.css'
})
export class KnbbMatchLijstComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);

    match: Match = new Match();
    spelerLijsten: ScoreSpeler[] = [];
    dim: LijstDimensies = new LijstDimensies();
    idxWed: number = -1;
    matchRead: boolean = false;

    fillScoreLijsten(): void {
        this.dim.maxBrt = this.match.maxBeurten;
        this.bepaalDimensies();
        this.match.spelers.forEach(spl => {
            let scoreSpeler = new ScoreSpeler();
            scoreSpeler.naam = spl.splBordNaam;
            scoreSpeler.tsCar = spl.splTsCar;
            scoreSpeler.dim = this.dim;
            let totaal = 0;
            for (let i = 0; i < this.dim.totBrt; i++) {
                let item = new ScoreBeurt();
                if (i < spl.stand.score.length) {
                    item.gespeeld = true;
                    item.serie = spl.stand.score[i];
                    totaal += item.serie;
                    item.totaal = totaal;
                }
                else {
                    item.verberg = i >= this.dim.maxBrt;
                }
                scoreSpeler.scores.push(item);
            }
            this.spelerLijsten.push(scoreSpeler);
        });
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Escape' || event.key === 'Backspace') {
            event.stopPropagation();
            this.escapePressed();
            return false;
        }
        return false;
    }

    ngOnInit(): void {
        let idx = this.route.snapshot.paramMap.get('wedNr');
        if (idx) {
            if (!this.helper.isValidInteger(idx)) {
                this.alert.showError(`ERROR : foutieve wedstrijd index : '${idx}'.`);
                this.escapePressed();
                return;
            }
            const wedIdx = Number(idx);
            if (wedIdx < 1 || wedIdx > 3) {
                this.alert.showError(`ERROR : foutieve wedstrijd index : '${wedIdx}'.`);
                this.escapePressed();
                return
            }
            this.idxWed = wedIdx - 1;
        }
        if (this.idxWed < 0) {
            this.initForMatch();
        }
        else {
            this.initForTeamMatch();
        }
    }

    private initForMatch() {
        this.bssApi.getKnbbMatch()
        .then(resp => {
            if (resp.gevonden) {
                this.match = resp.match;
                this.fillScoreLijsten();
                this.matchRead = true;
            }
            else {
                this.alert.showError('ERROR opvragen lijsten : bestand match.json niet gevonden.');
                this.escapePressed();
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private initForTeamMatch() {
        this.bssApi.getKnbbTeamMatch()
        .then(resp => {
            if (resp.gevonden) {
                const teamMatch: TeamMatch = resp.match;
                this.match = new Match();
                this.match.maxBeurten = teamMatch.maxBeurten;
                this.match.spelers[0] = teamMatch.teams[0].spelers[this.idxWed];
                this.match.spelers[1] = teamMatch.teams[1].spelers[this.idxWed];
                this.fillScoreLijsten();
                this.matchRead = true;
            }
            else {
                this.alert.showError('ERROR opvragen lijsten : bestand teammatch.json niet gevonden.');
                this.escapePressed();
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private bepaalDimensies() {
        this.dim.pageRows = 30;
        this.dim.rowHeight = 1;
        this.dim.fontSize = .75;
        if (this.dim.maxBrt <= 30) {
            this.dim.totBrt = 30;
            this.dim.pages = [0];
        }
        else if (this.dim.maxBrt <= 60) {
            this.dim.totBrt = 60;
            this.dim.pages = [0, 1];
        }
        else if (this.dim.maxBrt <= 90) {
            this.dim.totBrt = 90;
            this.dim.pages = [0, 1, 2];
        }
        else {
            this.dim.totBrt = 120;
            this.dim.pages = [0, 1, 2, 3];
        }
    }

}
