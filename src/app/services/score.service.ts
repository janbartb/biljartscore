import { Injectable } from '@angular/core';
import { CmpMatchSpeler, CompetitieMatch } from '../model/competitie';
import { WedSpeler, Wedstrijd, WedTeam } from '../model/wedstrijd';

@Injectable({
    providedIn: 'root'
})
export class ScoreService {

    constructor() { }

    createWedFromCompMatch(match: CompetitieMatch): Wedstrijd {
        let result = new Wedstrijd();
        Object.assign(result.regels, match.regels);
        Object.assign(result.telling, match.telling);
        result.opslaanInComp = true;
        result.wedOpgeslagen = match.opgeslagen;
        result.wedGespeeld = match.matchOver;
        match.spelers.forEach(spl => {
            result.spelers.push(this.createWedSpelerFromCompMatchSpeler(spl));
        });
        return result;
    }

    createWedSpelerFromCompMatchSpeler(speler: CmpMatchSpeler): WedSpeler {
        let result = new WedSpeler();
        result.splId = speler.id;
        result.splNaam = speler.naam;
        result.splBordNaam = speler.bordNaam;
        result.splSpreekNaam = speler.spreekNaam;
        result.metWit = speler.metWit;
        result.actief = speler.active;
        result.splTsMoy = speler.tsMoy;
        result.splTsCar = speler.tsCar;
        result.splTsBrt = speler.tsBrt;
        Object.assign(result.stand, speler.stand);
        return result;
    }

    createWedSpelerFromWedTeam(team: WedTeam): WedSpeler {
        let result = new WedSpeler();
        result.splId = team.teamId;
        result.splNaam = team.teamNaam;
        result.splBordNaam = team.teamNaam;
        result.metWit = team.metWit;
        result.actief = team.actief;
        result.splTsMoy = team.teamTsMoy;
        result.splTsCar = team.teamTsCar;
        result.splTsBrt = team.teamTsBrt;
        result.stand = team.stand;
        return result;
    }

    updateCompMatchFromWedstrijd(match: CompetitieMatch, wed: Wedstrijd) {
        match.matchOver = wed.wedGespeeld;
        match.spelers.forEach((spl, idx) => {
            const wedSpl = wed.spelers[idx];
            spl.active = wedSpl.actief;
            spl.metWit = wedSpl.metWit;
            Object.assign(spl.stand, wedSpl.stand);
        });
    }
}
