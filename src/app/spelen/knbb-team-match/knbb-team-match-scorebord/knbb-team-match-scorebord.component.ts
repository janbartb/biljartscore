import { Component, inject, OnInit } from '@angular/core';
import { MatchSpeler, TeamMatch } from '../../../model/match';
import { WedSpeler, Wedstrijd } from '../../../model/wedstrijd';
import { BaseComponent } from '../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../../services/helper.service';
import { ScorebordComponent } from '../../../shared/scorebord/scorebord.component';

@Component({
    selector: 'app-knbb-team-match-scorebord',
    standalone: true,
    imports: [
        ScorebordComponent
    ],
    templateUrl: './knbb-team-match-scorebord.component.html',
    styleUrl: './knbb-team-match-scorebord.component.css'
})
export class KnbbTeamMatchScorebordComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);

    match: TeamMatch = new TeamMatch();
    idxWed: number = -1;
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedReady: boolean = false;

    override escapePressed(): void {
        this.router.navigate(['teammatch/' + (this.idxWed + 1)]);
    }

    handleKey(key: string) {
        if (key == 'Escape') {
            this.escapePressed();
        }
        else if (key == 'Lijst') {
            this.appData.gotoPage(this.router.url, `match/lijst/${this.idxWed + 1}`);
        }
    }

    updateAndSaveTeamMatch(wed: Wedstrijd) {
        this.updateTeamMatchFromWedstrijd(wed);
        this.saveMatch();
    }

    ngOnInit(): void {
        let idx = this.route.snapshot.paramMap.get('wedNr');
        if (!idx) {
            idx = 'a';
        }
        if (!this.helper.isValidInteger(idx)) {
            this.router.navigate(['teammatch']);
            return;
        }
        const wedIdx = Number(idx) - 1;
        console.log(wedIdx);
        if (wedIdx < 0 || wedIdx > 2) {
            this.router.navigate(['teammatch']);
            return;
        }
        this.idxWed = wedIdx;
        this.bssApi.getKnbbTeamMatch()
        .then(resp => {
            if (!resp.gevonden) {
                this.alert.showError('ERROR scorebord : bestand teammatch.json niet gevonden.');
                this.router.navigate(['teammatch']);
                return;
            }
            this.match = resp.match;
            this.wedstrijd = this.createWedstrijdFromKnbbTeamMatch();
            this.wedReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    private saveMatch() {
        this.bssApi.saveKnbbTeamMatch(this.match)
        .then(() => {})
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private updateTeamMatchFromWedstrijd(wed: Wedstrijd) {
        this.match.gameOver[this.idxWed] = wed.wedGespeeld;
        this.match.matchOver = this.match.gameOver.every(gesp => gesp);
        wed.spelers.forEach((spl, idxT) => {
            let matchSpl = this.match.teams[idxT].spelers[this.idxWed];
            matchSpl.isActief = spl.actief;
            matchSpl.metWit = spl.metWit;
            Object.assign(matchSpl.stand, spl.stand);
        });
    }

    private createWedstrijdFromKnbbTeamMatch(): Wedstrijd {
        let result = new Wedstrijd();
        result.regels.idxOptie = 0;
        result.regels.knbbKlasse = this.match.klasse;
        result.regels.maxBeurten = this.match.maxBeurten;
        result.telling.idxOptie = 0;
        result.telling.bovenMoyPunten = 1;
        result.wedGespeeld = this.match.gameOver[this.idxWed];
        this.match.teams.forEach(team => {
            result.spelers.push(this.createWedSpelerFromMatchSpeler(team.spelers[this.idxWed]));
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
