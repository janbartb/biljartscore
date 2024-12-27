import { ElementRef, inject, Injectable } from '@angular/core';
import { WedSpelerStand, Wedstrijd, WedTeamStand } from '../model/wedstrijd';
import { Match, TeamMatch } from '../model/match';
import { AlertService } from './alert.service';
import { KnbbCompetitie } from '../model/knbb-competitie';
import { Team, Vereniging } from '../model/vereniging';

@Injectable({
    providedIn: 'root'
})
export class HelperService {
    alert = inject(AlertService);

    constructor() { }

    isValidInteger(val: string): boolean {
        let nr = Number(val);
        if (isNaN(nr) || nr <= 0) {
            return false;
        }
        if (!Number.isInteger(nr)) {
            return false;
        }
        return true;
    }

    isValidIntegerOrZero(val: string): boolean {
        let nr = Number(val);
        if (isNaN(nr) || nr < 0) {
            return false;
        }
        if (!Number.isInteger(nr)) {
            return false;
        }
        return true;
    }

    isValidNumber(val: string): boolean {
        let nr = Number(val);
        if (isNaN(nr) || nr <= 0) {
            return false;
        }
        return true;
    }

    setFocus(elm: HTMLInputElement | undefined) {
        if (elm) {
            setTimeout(() => {
                elm.focus();                    
            }, 200);    
        }
    }

    areWedstrijdSpelersFilled(wedstrijd: Wedstrijd): boolean {
        if (wedstrijd.aantSpelers == 0) {
            return false;
        }
        if (wedstrijd.aantSpelers == 5) {
            return wedstrijd.teams.every(team => {
                return team.spelers.every(spl => spl.splId != '');
            });
        }
        return wedstrijd.spelers.every(spl => spl.splId != '');
    }

    hasUniqueValues(arr: string[]): boolean {
        let toCheck = arr.map(txt => txt.trim());
        return toCheck.filter((value, index, self) => self.indexOf(value) === index).length === toCheck.length;
    }

    clearWedstrijdResultaten(wedstrijd: Wedstrijd) {
        wedstrijd.wedOver = false;
        wedstrijd.idxTeam = -1;
        wedstrijd.idxSpeler = -1;
        wedstrijd.teams.forEach((team, idxT) => {
            team.active = idxT == 0;
            team.metWit = idxT == 0;
            if (wedstrijd.isVastAantBrt) {
                team.teamTsCar = 0;
            }
            if (wedstrijd.isVastAantCar) {
                team.teamTsBrt = 0;
            }
            team.stand = new WedTeamStand();
            team.spelers.forEach((spl, idxS) => {
                spl.active = idxT == 0 && idxS == 0;
                spl.metWit = idxT == 0;
                if (wedstrijd.isVastAantBrt) {
                    spl.splTsCar = 0;
                }
                if (wedstrijd.isVastAantCar) {
                    spl.splTsBrt = 0;
                }
                spl.stand = new WedSpelerStand();
            });
        });
        wedstrijd.spelers.forEach((spl, idx) => {
            spl.active = idx == 0;
            spl.metWit = idx % 2 == 0;
            if (wedstrijd.isVastAantBrt) {
                spl.splTsCar = 0;
            }
            if (wedstrijd.isVastAantCar) {
                spl.splTsBrt = 0;
            }
            spl.stand = new WedSpelerStand();
        });
    }

    isTeamWedstrijdOver(match: TeamMatch, idxWed: number): boolean {
        const spl = match.teams[0].spelers[idxWed];
        const teg = match.teams[1].spelers[idxWed];
        if (teg.stand.aantBrt === match.maxBeurten) {
            return true;
        }
        if ((spl.stand.aantCar === spl.splTsCar || teg.stand.aantCar === teg.splTsCar) && spl.stand.aantBrt === teg.stand.aantBrt) {
            return true;
        }
        return false;
    }

    isWedstrijdOver(match: Match): boolean {
        const spl = match.spelers[0];
        const teg = match.spelers[1];
        if (teg.stand.aantBrt === match.maxBeurten) {
            return true;
        }
        if ((spl.stand.aantCar === spl.splTsCar || teg.stand.aantCar === teg.splTsCar) && spl.stand.aantBrt === teg.stand.aantBrt) {
            return true;
        }
        return false;
    }

    scrollUp(elem?: ElementRef<HTMLDivElement>): void {
        if (elem) {
            elem.nativeElement.scrollTop = 0;
        }
    }

    scrollDown(elem?: ElementRef<HTMLDivElement>): void {
        if (elem) {
            elem.nativeElement.scrollTop = elem.nativeElement.scrollHeight;
        }
    }

    getCompetitieTeamsData(comp: KnbbCompetitie, verenigingen: Vereniging[]): Team[] {
        let teams: Team[] = [];
        const allFound = comp.teams.every(compTeam => {
            const vereniging = verenigingen.find(ver => ver.verId == compTeam.verId);
            if (vereniging) {
                const team = vereniging.teams.find(tm => tm.teamId == compTeam.teamId);
                if (team) {
                    teams.push(team);
                }
                else {
                    this.alert.showError(`Team met ID '${compTeam.verId}' niet geveonden in vereniging ${vereniging.naam}.`);
                    return false;
                }
            }
            else {
                this.alert.showError(`Vereniging met ID '${compTeam.verId}' niet geveonden.`);
                return false;
            }
            return true;
        });
        if (!allFound) {
            return [];
        }
        return teams;
    }
}
