import { Component, HostListener, OnInit } from '@angular/core';
import { OefWedSpeler, OefWedstrijd } from '../../../model/oef-wedstrijd';
import { BaseComponent } from '../../../base/base.component';
import { LijstDimensies, ScoreBeurt, ScoreSpeler } from '../../../model/score-beurt';
import { WedLijstSpelerComponent } from "./wed-lijst-speler/wed-lijst-speler.component";

@Component({
    selector: 'app-wed-lijst',
    standalone: true,
    imports: [WedLijstSpelerComponent],
    templateUrl: './wed-lijst.component.html',
    styleUrl: './wed-lijst.component.css'
})
export class WedLijstComponent extends BaseComponent implements OnInit {
    wedstrijd: OefWedstrijd = new OefWedstrijd();
    spelerLijsten: ScoreSpeler[] = [];
    spelers: OefWedSpeler[] = [];
    dataReady: boolean = false;
    dim: LijstDimensies = new LijstDimensies();

    fillScoreLijsten(): void {
        this.dim.maxBrt = 100;
        if (this.wedstrijd.isVastAantBrt) {
            this.dim.maxBrt = this.wedstrijd.tsBeurten;
        }
        else {
            if (this.wedstrijd.maxBeurten > 0) {
                this.dim.maxBrt = this.wedstrijd.maxBeurten;
            }
        }
        this.bepaalDimensies();
        if (this.wedstrijd.aantSpelers == 5) {
            this.wedstrijd.teams.forEach(team => {
                team.spelers.forEach(spl => this.spelers.push(spl));
            });
        }
        else {
            this.spelers = this.wedstrijd.spelers;
        }
        this.spelers.forEach(spl => {
            let scoreSpeler = new ScoreSpeler();
            scoreSpeler.naam = spl.splBordNaam;
            scoreSpeler.tsCar = this.wedstrijd.isVastAantBrt ? 0 : this.wedstrijd.isVastAantCar ? this.wedstrijd.tsCaramboles : spl.splTsCar;
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
        this.bssApi.getWedstrijd()
        .then(resp => {
            if (resp.gevonden) {
                this.wedstrijd = resp.wedstrijd;
                this.fillScoreLijsten();
                this.dataReady = true;
            }
            else {
                console.log('Wedstrijdlijst : bestand wedstrijd.json niet gevonden - terug naar wedstrijd pagina.');
                this.router.navigate(['wedstrijd']);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private bepaalDimensies() {
        if (this.wedstrijd.aantSpelers <= 2) {
            this.bepaalDimensies2spelers();
        }
        else if (this.wedstrijd.aantSpelers == 3) {
            this.bepaalDimensies3spelers();
        }
        else {
            this.bepaalDimensies4spelers();
        }
    }

    private bepaalDimensies2spelers() {
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

    private bepaalDimensies3spelers() {
        if (this.dim.maxBrt <= 60) {
            this.dim.pageRows = 30;
            this.dim.rowHeight = 1;
            this.dim.fontSize = .75;
            this.dim.totBrt = 60;
            this.dim.pages = [0, 1];
            if (this.dim.maxBrt <= 30) {
                this.dim.totBrt = 30;
                this.dim.pages = [0];
            }
        }
        else if (this.dim.maxBrt <= 90) {
            this.dim.pageRows = 30;
            this.dim.rowHeight = 1;
            this.dim.fontSize = .7;
            this.dim.totBrt = 90;
            this.dim.pages = [0, 1, 2];
        }
        else {
            this.dim.pageRows = 40;
            this.dim.rowHeight = .75;
            this.dim.fontSize = .625;
            this.dim.totBrt = 120;
            this.dim.pages = [0, 1, 2];
        }    
    }

    private bepaalDimensies4spelers() {
        if (this.dim.maxBrt <= 60) {
            this.dim.pageRows = 30;
            this.dim.rowHeight = 1;
            this.dim.fontSize = .75;
            this.dim.totBrt = 60;
            this.dim.pages = [0, 1];
            if (this.dim.maxBrt <= 30) {
                this.dim.totBrt = 30;
                this.dim.pages = [0];
            }
        }
        else if (this.dim.maxBrt <= 80) {
            this.dim.pageRows = 40;
            this.dim.rowHeight = .75;
            this.dim.fontSize = .625;
            this.dim.totBrt = 80;
            this.dim.pages = [0, 1];
        }
        else {
            this.dim.pageRows = 40;
            this.dim.rowHeight = .75;
            this.dim.fontSize = .53125;
            this.dim.totBrt = 120;
            this.dim.pages = [0, 1, 2];
        }    
    }
}
