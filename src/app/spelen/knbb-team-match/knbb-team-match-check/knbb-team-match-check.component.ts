import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../base/base.component';
import { MatchSpelerStand, MatchTeam, TeamMatch } from '../../../model/match';
import { MoyenneTabel } from '../../../model/moyenne-tabel';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { Button } from '../../../model/button';
import { DOCUMENT } from '@angular/common';
import { HelperService } from '../../../services/helper.service';

@Component({
    selector: 'app-knbb-team-match-check',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ButtonComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './knbb-team-match-check.component.html',
    styleUrl: './knbb-team-match-check.component.css'
})
export class KnbbTeamMatchCheckComponent extends BaseComponent implements OnInit {
    private helper = inject(HelperService);
    private document = inject(DOCUMENT);

    match: TeamMatch = new TeamMatch();
    teams: MatchTeam[] = [];
    moyTabel: MoyenneTabel = new MoyenneTabel();
    idxTeam: number = -1;
    idxSpeler: number = -1;
    matchGestart: boolean = false;
    matchChanged: boolean = false;
    namesChanged: boolean = false;
    matchValid: boolean = false;
    naamValid: boolean[][] = [[true, true, true], [true, true, true]];
    moyValid: boolean[][] = [[true, true, true], [true, true, true]];
    carValid: boolean[][] = [[true, true, true], [true, true, true]];
    escapeCount: number = 0;
    wedStatus: number[] = [0, 0, 0];
    voortgang: string[] = ['0%', '0%', '0%'];
    dataReady: boolean = false;

    enterButton: Button = new Button('Enter', 'Naar match', true);
    opnieuwButton: Button = new Button('Ctrl+Enter', 'Start opnieuw', true);
    resetButton: Button = new Button('R', 'Reset', true);

    override escapePressed(): void {
        if (this.idxTeam >= 0) {
            this.idxTeam = -1;
            this.idxSpeler = -1;
            this.setEscapeCount();
        }
        else {
            this.previousClicked();
        }
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.enterClicked();
            }
            else if (button.key == 'Ctrl+Enter') {
                this.opnieuwClicked();
            }
            else if (button.key == 'R') {
                this.resetClicked();
            }
        }, 300);
    }

    previousClicked() {
        this.router.navigate(['teammatch/setup/gasten']);
    }

    enterClicked() {
        if (!this.matchValid) {
            return;
        }
        if (this.matchChanged) {
            this.match.teams = this.teams;
            this.clearMatchScores();
        }
        else if (this.namesChanged) {
            this.match.teams = this.teams;
        }
        this.saveMatchAndContinue();
    }

    opnieuwClicked() {
        if (this.matchChanged || !this.matchValid) {
            return;
        }
        if (this.namesChanged) {
            this.match.teams = this.teams;
        }
        this.clearMatchScores();
        this.saveMatchAndContinue();
    }

    resetClicked() {
        this.idxTeam = -1;
        this.idxSpeler = -1;
        this.copyTeams();
        this.hasMatchChanged();
        this.isMatchValid();
    }

    maakSpelerActief(idxT: number, idxS: number) {
        this.idxTeam = idxT;
        this.idxSpeler = idxS;
        const elmId = 'naam' + idxT + idxS;
        let elm = <HTMLInputElement> this.document.getElementById(elmId);
        setTimeout(() => {
            elm.focus();
        }, 100);
    }

    keyupMoyenne(idxT:number, idxS: number) {
        let spl = this.teams[idxT].spelers[idxS];
        this.moyValid[idxT][idxS] = this.helper.isValidNumber('' + spl.splTsGem);
        if (this.moyValid[idxT][idxS]) {
            spl.splTsGem = Number(spl.splTsGem);
            spl.splTsCar = this.bepaalAantalCaramboles(spl.splTsGem);
            this.isMatchValid();
        }
        else {
            this.matchValid = false;
        }
        this.hasMatchChanged();
    }

    keyupCaramboles(idxT:number, idxS: number) {
        let spl = this.teams[idxT].spelers[idxS];
        this.carValid[idxT][idxS] = this.helper.isValidInteger('' + spl.splTsCar);
        if (this.carValid[idxT][idxS]) {
            spl.splTsCar = Number(spl.splTsCar);
            this.isMatchValid();
        }
        else {
            this.matchValid = false;
        }
        this.hasMatchChanged();
    }

    keyupNaam(idxT:number, idxS: number) {
        let spl = this.teams[idxT].spelers[idxS];
        this.naamValid[idxT][idxS] = spl.splBordNaam != '';
        if (this.naamValid[idxT][idxS]) {
            this.isMatchValid();
        }
        else {
            this.matchValid = false;
        }
        this.hasMatchChanged();
    }

    stopPropagation(event: any) {
        event.stopPropagation();
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        if (event.code === 'KeyR') {
            if (fromInput) {
                if ((<HTMLInputElement> event.target).id.startsWith('naam')) {
                    return true;
                }
                event.preventDefault();
                return false;
            }
            return true;    
        }
        return true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowLeft' || event.key ==='ArrowRight') {
            if (!fromInput || event.ctrlKey) {
                this.veranderVanTeam(event.key ==='ArrowLeft' ? -1 : 1);
                this.setEscapeCount();
                return false;    
            }
            return true;
        }
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.ctrlKey) {
                this.moveSpeler(event.key ==='ArrowUp' ? -1 : 1);
                return false;
            }
            this.veranderVanSpeler(event.key ==='ArrowUp' ? -1 : 1);
            this.setEscapeCount();
            return false; 
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.buttonPressed(this.opnieuwButton);
            }
            else {
                this.buttonPressed(this.enterButton);
            }
            return false;
        }
        if (event.code === 'KeyR') {
            if (fromInput && (<HTMLInputElement> event.target).id.startsWith('naam')) {
                return false;
            }
            this.buttonPressed(this.resetButton);
            return false;    
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.bssApi.getKnbbTeamMatch()
        .then(resp => {
            if (resp.gevonden) {
                this.match = resp.match;
                this.isMatchAlGestart();
                this.bssApi.getMoyenneTabel(this.spelId + '-' + this.match.klasse)
                .then(result => {
                    this.moyTabel = result;
                    this.initBepaalAantalCaramboles();
                    this.copyTeams();
                    this.isMatchValid();
                    this.bepaalMatchStatusEnVoortgang();
                    this.dataReady = true;
                })
                .catch(err => {
                    this.alert.showError(err);
                })
            }
            else {
                console.log('teammatch.json niet gevonden! Vreemd...');
                this.router.navigate(['teammatch/setup/comp']);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    private isMatchAlGestart() {
        this.matchGestart = this.match.teams[0].spelers.some(spl => spl.stand.aantBrt > 0);
    }

    private isMatchValid() {
        this.matchValid = this.teams.every((team, idxT) => {
            return team.spelers.every((spl, idxS) => {
                if (spl.splTsGem > 0 && spl.splTsCar > 0 && spl.splBordNaam != '') {
                    if (idxS == 0) {
                        return true;
                    }
                    const prevAantCar = this.teams[idxT].spelers[idxS - 1].splTsCar;
                    if (spl.splTsCar >= prevAantCar) {
                        return true;
                    }
                    return false;
                }
                else {
                    return false;
                }
            });
        });
    }

    private hasMatchChanged() {
        this.namesChanged = false;
        this.matchChanged = false;
        [0, 1, 2].forEach(idxWed => {
            if (this.hasWedstrijdChanged(idxWed)) {
                this.matchChanged = true;
                this.wedStatus[idxWed] = 0;
                this.voortgang[idxWed] = '0%';
            }
            else {
                this.bepaalWedstrijdStatusEnVoortgang(idxWed);
            }
        })
        if (!this.matchChanged) {
            this.haveNamesChanged();
        }
        this.setEscapeCount();
    }

    private hasWedstrijdChanged(idxWed: number): boolean {
        return this.teams.some(((team, idxTeam) => {
            const spl = team.spelers[idxWed];
            const origSpl = this.match.teams[idxTeam].spelers[idxWed];
            return spl.splId != origSpl.splId || spl.splTsGem != origSpl.splTsGem || spl.splTsCar != origSpl.splTsCar;
        }))
    }

    private haveNamesChanged() {
        this.namesChanged = this.teams.some((team, idxT) => {
            return team.spelers.some((spl, idxS) => {
                const origSpl = this.match.teams[idxT].spelers[idxS];
                return spl.splBordNaam != origSpl.splBordNaam;
            });
        });
    }

    private moveSpeler(direction: number) {
        if (this.idxTeam < 0 || this.idxSpeler < 0) {
            return;
        }
        let idxOld = this.idxSpeler;
        let idxNew = idxOld + direction;
        if (idxNew < 0 || idxNew > 2) {
            return;
        }
        let team = this.teams[this.idxTeam];
        let tempSpl = team.spelers[idxNew];
        team.spelers[idxNew] = team.spelers[idxOld];
        team.spelers[idxOld] = tempSpl;
        this.idxSpeler = idxNew;
        this.isMatchValid();
        this.hasMatchChanged();
    }

    private veranderVanTeam(direction: number) {
        let idxS = this.idxSpeler;
        if (idxS < 0) {
            idxS = 0;
        }
        let idxT = this.idxTeam;
        idxT += direction;
        if (idxT < 0) {
            idxT = 1;
        }
        if (idxT > 1) {
            idxT = 0;
        }
        this.maakSpelerActief(idxT, idxS);
    }

    private veranderVanSpeler(direction: number) {
        let idxT = this.idxTeam;
        if (idxT < 0) {
            idxT = 0;
        }
        let idxS = this.idxSpeler;
        idxS += direction;
        if (idxS < 0) {
            idxS = 2;
        }
        if (idxS > 2) {
            idxS = 0;
        }
        this.maakSpelerActief(idxT, idxS);
    }

    private bepaalMatchStatusEnVoortgang(): void {
        [0 ,1, 2].forEach(idxWed => {
            this.bepaalWedstrijdStatusEnVoortgang(idxWed);
        });
    }

    private bepaalWedstrijdStatusEnVoortgang(idxWed: number): void {
        // status
        const spl = this.match.teams[0].spelers[idxWed];
        this.wedStatus[idxWed] = 0;
        if (spl.stand.aantBrt > 0) {
            this.wedStatus[idxWed] = 1;
        }
        if (this.match.gameOver[idxWed]) {
            this.wedStatus[idxWed] = 2;
        }
        // voortgang
        const maxBrt = this.match.maxBeurten;
        let vg = 0;
        const teg = this.match.teams[1].spelers[idxWed];
        if (this.wedStatus[idxWed] == 0) {
            vg = 0;
        }
        else if (this.wedStatus[idxWed] == 2) {
            vg = 100;
        }
        else {
            vg = Math.max(spl.stand.aantCar / spl.splTsCar, teg.stand.aantCar / teg.splTsCar, (spl.stand.aantBrt + teg.stand.aantBrt) / (2 * maxBrt)) * 100;
        }
        this.voortgang[idxWed] = vg + '%';
     }

    private bepaalAantalCaramboles(moy: number): number {
        let result = this.moyTabel.minimum;
        this.moyTabel.moyennes.every(entry => {
            if (moy >= entry.vanaf) {
                result = entry.cars;
                return true;
            }
            return false;
        });
        return result;
    }

    private initBepaalAantalCaramboles() {
        this.match.teams.forEach((team) => {
            team.spelers.forEach((spl) => {
                if (spl.splTsCar == 0) {
                    spl.splTsCar = this.bepaalAantalCaramboles(spl.splTsGem);
                }
            })
        })
    }

    private clearMatchScores() {
        this.match.matchOver = false;
        this.match.gameOver = [false, false, false];
        this.match.teams.forEach(team => {
            team.spelers.forEach(spl => {
                spl.isActief = false;
                spl.stand = new MatchSpelerStand();
            });
        });
    }

    private copyTeams() {
        this.teams = JSON.parse(JSON.stringify(this.match.teams));
        this.matchChanged = false;
    }

    private setEscapeCount() {
        this.escapeCount = (this.idxSpeler >= 0) ? 1 : 0;
    }

    private saveMatchAndContinue() {
        this.bssApi.saveKnbbTeamMatch(this.match)
        .then(() => {
            this.router.navigate(['teammatch']);
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }
}
