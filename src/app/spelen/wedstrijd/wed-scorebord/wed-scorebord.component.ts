import { Component, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { OefWedSpeler, OefWedstrijd, OefWedTeam } from '../../../model/oef-wedstrijd';
import { WedSpeler, Wedstrijd, WedTeam } from '../../../model/wedstrijd';
import { ScorebordComponent } from '../../../shared/scorebord/scorebord.component';

@Component({
    selector: 'app-wed-scorebord',
    standalone: true,
    imports: [
        ScorebordComponent
    ],
    templateUrl: './wed-scorebord.component.html',
    styleUrl: './wed-scorebord.component.css'
})
export class WedScorebordComponent extends BaseComponent implements OnInit {
    oefenWed: OefWedstrijd = new OefWedstrijd();
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedReady: boolean = false;

    override escapePressed(): void {
        this.router.navigate(['wedstrijd']);
    }

    handleKey(key: string) {
        if (key == 'Escape') {
            this.escapePressed();
        }
        else if (key == 'Lijst') {
            const toUrl = this.router.url.replace('score', 'lijst');
            this.appData.gotoPage(this.router.url, toUrl);
        }
    }

    updateAndSaveOefenWed(wed: Wedstrijd) {
        this.updateOefenWedFromWedstrijd(this.oefenWed, wed);
        this.saveOefenWed();
    }

    ngOnInit(): void {
        this.bssApi.getOefenWedstrijd()
        .then(resp => {
            if (!resp.gevonden) {
                console.log('Match niet gevonden. Vreemd...');
                this.router.navigate(['wedstrijd']);
                return;
            }
            this.oefenWed = resp.wedstrijd;
            this.wedstrijd = this.createWedstrijdFromOefenWed(this.oefenWed);
            this.wedReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private saveOefenWed() {
        this.bssApi.saveOefenWedstrijd(this.oefenWed)
        .then(() => {})
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private createWedstrijdFromOefenWed(wed: OefWedstrijd): Wedstrijd {
        let result = new Wedstrijd();
        result.aantSpelers = wed.aantSpelers;
        result.wedGespeeld = wed.wedOver;
        if (wed.isVastAantBrt) {
            result.regels.idxOptie = 1;
            result.regels.vastAantBrt = wed.tsBeurten;
            result.regels.maxBeurten = wed.tsBeurten;
        }
        else if (wed.isVastAantCar) {
            result.regels.idxOptie == 2;
            result.regels.vastAantCar = wed.tsCaramboles;
            result.regels.maxBeurten = (wed.maxBeurten > 0) ? wed.maxBeurten : 0;
        }
        else {
            result.regels.idxOptie == 3;
            result.regels.moyAantBrt = wed.tsBeurten;
            result.regels.maxBeurten = (wed.maxBeurten > 0) ? wed.maxBeurten : 0;
        }
        result.telling.idxOptie = 1;
        result.telling.winstPunten = 2;
        result.telling.gelijkPunten = 1;
        result.telling.bovenMoyPunten = 1;
        if (wed.teams.length > 0) {
            wed.teams.forEach(team => {
                result.teams.push(this.createWedTeamFromOefWedTeam(team));
            });
        }
        else {
            wed.spelers.forEach(spl => {
                result.spelers.push(this.createWedSpelerFromOefWedSpeler(spl));
            });
        }
        return result;
    }

    private createWedTeamFromOefWedTeam(team: OefWedTeam): WedTeam {
        let result = new WedTeam();
        result.teamNaam = team.teamNaam;
        result.actief = team.active;
        result.metWit = team.metWit;
        result.teamTsCar = team.teamTsCar;
        result.teamTsBrt = team.teamTsBrt;
        result.teamTsMoy = team.teamTsGem;
        Object.assign(result.stand, team.stand);
        team.spelers.forEach(spl => {
            result.spelers.push(this.createWedSpelerFromOefWedSpeler(spl));
        });
        return result;
    }

    private createWedSpelerFromOefWedSpeler(spl: OefWedSpeler): WedSpeler {
        let result = new WedSpeler();
        result.splId = spl.splId;
        result.splNaam = spl.splNaam;
        result.splBordNaam = spl.splBordNaam;
        result.splSpreekNaam = spl.splSpreekNaam;
        result.actief = spl.active;
        result.metWit = spl.metWit;
        result.splTsCar = spl.splTsCar;
        result.splTsBrt = spl.splTsBrt;
        result.splTsMoy = spl.splTsGem;
        Object.assign(result.stand, spl.stand);
        return result;
    }

    private updateOefenWedFromWedstrijd(oef: OefWedstrijd, wed: Wedstrijd) {
        oef.wedOver = wed.wedGespeeld;
        if (oef.teams.length > 0) {
            oef.teams.forEach((team, idxT) => {
                const wedTeam = wed.teams[idxT];
                team.active = wedTeam.actief;
                team.metWit = wedTeam.metWit;
                Object.assign(team.stand, wedTeam.stand);
                team.spelers.forEach((spl, idx) => {
                    const wedSpl = wedTeam.spelers[idx];
                    spl.active = wedSpl.actief;
                    spl.metWit = wedSpl.metWit;
                    Object.assign(spl.stand, wedSpl.stand);
                });
            });
        }
        else {
            oef.spelers.forEach((spl, idx) => {
                const wedSpl = wed.spelers[idx];
                spl.active = wedSpl.actief;
                spl.metWit = wedSpl.metWit;
                Object.assign(spl.stand, wedSpl.stand);
            });
        }
    }
}
