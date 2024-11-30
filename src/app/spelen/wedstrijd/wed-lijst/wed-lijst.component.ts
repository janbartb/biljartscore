import { Component, HostListener, OnInit } from '@angular/core';
import { WedSpeler, Wedstrijd } from '../../../model/wedstrijd';
import { BaseComponent } from '../../../base/base.component';
import { ScoreBeurt, ScoreSpeler } from '../../../model/score-beurt';
import { WedLijstSpelerComponent } from "./wed-lijst-speler/wed-lijst-speler.component";

@Component({
    selector: 'app-wed-lijst',
    standalone: true,
    imports: [WedLijstSpelerComponent],
    templateUrl: './wed-lijst.component.html',
    styleUrl: './wed-lijst.component.css'
})
export class WedLijstComponent extends BaseComponent implements OnInit {
    wedstrijd: Wedstrijd = new Wedstrijd();
    spelerLijsten: ScoreSpeler[] = [];
    spelers: WedSpeler[] = [];
    dataReady: boolean = false;

    fillScoreLijsten(): void {
        let lijstLength = 100;
        let pages = [0, 1, 2, 3];
        let pageSize = 25;
        let maxBeurten = 100;
        if (this.wedstrijd.isVastAantBrt) {
            maxBeurten = this.wedstrijd.tsBeurten;
        }
        else {
            if (this.wedstrijd.maxBeurten > 0) {
                maxBeurten = this.wedstrijd.maxBeurten;
            }
        }
        if (maxBeurten <= 75) {
            lijstLength = 75;
            pages = [0, 1, 2];
        }
        if (maxBeurten <= 50) {
            lijstLength = 50;
            pages = [0, 1];
        }
        if (maxBeurten <= 25) {
            lijstLength = 25;
            pages = [0];
        }
        if (this.wedstrijd.aantSpelers == 3 && lijstLength == 100) {
            pages = [0, 1, 2];
            pageSize = 34;
            lijstLength = 102;
        }
        if (this.wedstrijd.aantSpelers >= 4 && lijstLength > 50) {
            pages = [0, 1, 2];
            if (lijstLength > 75) {
                pageSize = 34;
                lijstLength = 102;    
            }
        }
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
            scoreSpeler.tsCar = this.wedstrijd.isVastAantBrt ? 0 : this.wedstrijd.tsCaramboles;
            scoreSpeler.pages = pages;
            scoreSpeler.pageSize = pageSize;
            let totaal = 0;
            for (let i = 0; i < lijstLength; i++) {
                let item = new ScoreBeurt();
                if (i < spl.stand.score.length) {
                    item.gespeeld = true;
                    item.serie = spl.stand.score[i];
                    totaal += item.serie;
                    item.totaal = totaal;
                }
                else {
                    item.verberg = i >= maxBeurten;
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
}
