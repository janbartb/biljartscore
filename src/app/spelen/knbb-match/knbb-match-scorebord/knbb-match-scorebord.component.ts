import { Component, OnInit } from '@angular/core';
import { Match, MatchSpeler } from '../../../model/match';
import { WedSpeler, Wedstrijd } from '../../../model/wedstrijd';
import { BaseComponent } from '../../../base/base.component';
import { ScoreComponent } from "../../../shared/score/score.component";

@Component({
    selector: 'app-knbb-match-scorebord',
    standalone: true,
    imports: [
        ScoreComponent
    ],
    templateUrl: './knbb-match-scorebord.component.html',
    styleUrl: './knbb-match-scorebord.component.css'
})
export class KnbbMatchScorebordComponent extends BaseComponent implements OnInit {
    match: Match = new Match();
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedReady: boolean = false;

    override escapePressed(): void {
        this.router.navigate(['match']);
    }

    handleKey(key: string) {
        if (key == 'Escape') {
            this.escapePressed();
        }
        else if (key == 'Lijst') {
            this.appData.gotoPage(this.router.url, 'match/lijst');
        }
    }

    updateAndSaveMatch(wed: Wedstrijd) {
        this.updateMatchFromWedstrijd(wed);
        this.saveMatch();
    }

    ngOnInit(): void {
        this.bssApi.getKnbbMatch()
        .then(resp => {
            if (!resp.gevonden) {
                this.alert.showError('ERROR scorebord : bestand match.json niet gevonden.');
                this.router.navigate(['match']);
                return;
            }
            this.match = resp.match;
            this.wedstrijd = this.createWedstrijdFromKnbbMatch();
            this.wedReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        })        
    }

    private saveMatch() {
        this.bssApi.saveKnbbMatch(this.match)
        .then(() => {})
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private updateMatchFromWedstrijd(wed: Wedstrijd) {
        this.match.matchOver = wed.wedGespeeld;
        wed.spelers.forEach((spl, idx) => {
            let matchSpl = this.match.spelers[idx];
            matchSpl.isActief = spl.actief;
            matchSpl.metWit = spl.metWit;
            Object.assign(matchSpl.stand, spl.stand);
        });
    }

    private createWedstrijdFromKnbbMatch(): Wedstrijd {
        let result = new Wedstrijd();
        result.regels.idxOptie = 0;
        result.regels.knbbKlasse = this.match.klasse;
        result.regels.maxBeurten = this.match.maxBeurten;
        result.telling.idxOptie = 0;
        result.telling.bovenMoyPunten = 1;
        result.wedGespeeld = this.match.matchOver;
        this.match.spelers.forEach(spl => {
            result.spelers.push(this.createWedSpelerFromMatchSpeler(spl));
        });
        return result;
    }

    private createWedSpelerFromMatchSpeler(spl: MatchSpeler): WedSpeler {
        let result = new WedSpeler();
        result.splId = spl.splId;
        result.splNaam = spl.splNaam;
        result.splBordNaam = spl.splBordNaam;
        result.splSpreekNaam = spl.splSpreekNaam;
        result.actief = spl.isActief;
        result.metWit = spl.metWit;
        result.splTsCar = spl.splTsCar;
        result.splTsMoy = spl.splTsGem;
        Object.assign(result.stand, spl.stand);
        return result;
    }

}
