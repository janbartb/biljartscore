import { ElementRef, inject, Injectable } from '@angular/core';
import { Match, TeamMatch } from '../model/match';
import { AlertService } from './alert.service';
import { KnbbCompetitie } from '../model/knbb-competitie';
import { Team, Vereniging } from '../model/vereniging';
import { CompetitieMatch } from '../model/competitie';
import { DecimalPipe } from '@angular/common';
import { WedSpelerStand, Wedstrijd } from '../model/wedstrijd';

@Injectable({
    providedIn: 'root'
})
export class HelperService {
    alert = inject(AlertService);
    decPipe = inject(DecimalPipe);

    constructor() { }

    getHuidigJaar(): string {
        return '' + new Date().getFullYear();
    }

    getDateAsString(d: Date): string {
        const result = d.toLocaleDateString('nl-NL');
        return result;
    }

    getTimeAsString(d: Date): string {
        return d.toLocaleTimeString('nl-NL');
    }

    getDateTimeAsString(d: Date): string {
        return this.getDateAsString(d) + ' ' + this.getTimeAsString(d);
    }

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

    formatNumber(num: number, format: string): string {
        if (!format || format == '') {
            return '';
        }
        const result = this.decPipe.transform(num, format, 'nl-NL');
        return !result ? '' : result;
    }

    areWedstrijdSpelersFilled(wedstrijd: Wedstrijd): boolean {
        if (wedstrijd.aantSpelers == 0) {
            return false;
        }
        if (wedstrijd.aantSpelers == 5) {
            if (wedstrijd.teams.length == 0) {
                return false;
            }
            return wedstrijd.teams.every(team => {
                if (team.spelers.length == 0) {
                    return false;
                }
                return team.spelers.every(spl => spl.splId != '');
            });
        }
        if (wedstrijd.spelers.length == 0) {
            return false;
        }
        return wedstrijd.spelers.every(spl => spl.splId != '');
    }

    hasUniqueValues(arr: string[]): boolean {
        let toCheck = arr.map(txt => txt.trim());
        return toCheck.filter((value, index, self) => self.indexOf(value) === index).length === toCheck.length;
    }

    clearWedstrijdStanden(wedstrijd: Wedstrijd) {
        wedstrijd.wedGespeeld = false;
        wedstrijd.teams.forEach((team, idxT) => {
            team.actief = idxT == 0;
            team.metWit = idxT == 0;
            team.stand = new WedSpelerStand();
            team.spelers.forEach((spl, idxS) => {
                spl.actief = idxT == 0 && idxS == 0;
                spl.metWit = idxT == 0;
                spl.stand = new WedSpelerStand();
            });
        });
        wedstrijd.spelers.forEach((spl, idx) => {
            spl.actief = idx == 0;
            spl.metWit = idx % 2 == 0;
            spl.stand = new WedSpelerStand();
        });
    }

    clearWedstrijdResultaten(wedstrijd: Wedstrijd) {
        wedstrijd.wedGespeeld = false;
        wedstrijd.teams.forEach((team, idxT) => {
            team.actief = idxT == 0;
            team.metWit = idxT == 0;
            team.stand = new WedSpelerStand();
            team.spelers.forEach((spl, idxS) => {
                spl.actief = idxT == 0 && idxS == 0;
                spl.metWit = idxT == 0;
                spl.stand = new WedSpelerStand();
            });
        });
        wedstrijd.spelers.forEach((spl, idx) => {
            spl.actief = idx == 0;
            spl.metWit = idx % 2 == 0;
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

    isEigenMatchOver(match: CompetitieMatch): boolean {
        const spl = match.spelers[0];
        const teg = match.spelers[1];
        if (teg.stand.aantBrt === match.regels.maxBeurten) {
            return true;
        }
        if (match.regels.idxOptie != 1) {
            if ((spl.stand.aantCar === spl.tsCar || teg.stand.aantCar === teg.tsCar) && spl.stand.aantBrt === teg.stand.aantBrt) {
                return true;
            }    
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

    transform(txt: string): string {
        if (!txt || txt == '') {
            return '';
        }
        let res = 0;
        txt.split('').forEach((ch, idx) => {
            res += Number((idx + 3) + '1') * (txt.charCodeAt(idx) + 77);
        });
        res = (13 * res) + 7;
        return '' + res;
    }
}
