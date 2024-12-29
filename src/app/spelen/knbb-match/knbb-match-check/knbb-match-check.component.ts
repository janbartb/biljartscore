import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { FormsModule } from '@angular/forms';
import { DOCUMENT, NgClass } from '@angular/common';
import { BaseComponent } from '../../../base/base.component';
import { HelperService } from '../../../services/helper.service';
import { MoyenneTabel } from '../../../model/moyenne-tabel';
import { Match, MatchSpeler, MatchSpelerStand } from '../../../model/match';
import { Button } from '../../../model/button';

@Component({
    selector: 'app-knbb-match-check',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './knbb-match-check.component.html',
    styleUrl: './knbb-match-check.component.css'
})
export class KnbbMatchCheckComponent extends BaseComponent implements OnInit {
    private helper = inject(HelperService);
    private document = inject(DOCUMENT);

    match: Match = new Match();
    spelers: MatchSpeler[] = [];
    moyTabel: MoyenneTabel = new MoyenneTabel();
    idxSpeler: number = -1;
    matchGestart: boolean = false;
    matchChanged: boolean = false;
    namesChanged: boolean = false;
    matchValid: boolean = false;
    naamValid: boolean[] = [true, true];
    moyValid: boolean[] = [true, true];
    carValid: boolean[] = [true, true];
    escapeCount: number = 0;
    wedStatus: number = 0;
    voortgang: string = '0%';
    dataReady: boolean = false;

    buttons: Button[] = [
        new Button('R', 'Reset', true),
        new Button('Ctrl+Enter', 'Start opnieuw', true),
        new Button('Enter', 'Naar match', true)
    ];

    override escapePressed(): void {
        if (this.idxSpeler >= 0) {
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

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.resetClicked();
        }
        else if (idx == 1) {
            this.opnieuwClicked();
        }
        else if (idx == 2) {
            this.enterClicked();
        }
    }

    previousClicked() {
        this.router.navigate(['match/setup/spelers']);
    }

    enterClicked() {
        if (!this.matchValid) {
            return;
        }
        if (this.matchChanged) {
            this.match.spelers = this.spelers;
            this.clearMatchScores();
        }
        else if (this.namesChanged) {
            this.match.spelers = this.spelers;
        }
        this.saveMatchAndContinue();
    }

    opnieuwClicked() {
        if (this.matchChanged || !this.matchValid) {
            return;
        }
        if (this.namesChanged) {
            this.match.spelers = this.spelers;
        }
        this.clearMatchScores();
        this.saveMatchAndContinue();
    }

    resetClicked() {
        this.idxSpeler = -1;
        this.copySpelers();
        this.hasMatchChanged();
        this.isMatchValid();
    }

    maakSpelerActief(idx: number) {
        this.idxSpeler = idx;
        const elmId = 'naam' + idx;
        let elm = <HTMLInputElement> this.document.getElementById(elmId);
        setTimeout(() => {
            elm.focus();
        }, 100);
    }

    keyupMoyenne(idx: number) {
        let spl = this.spelers[idx];
        this.moyValid[idx] = this.helper.isValidNumber('' + spl.splTsGem);
        if (this.moyValid[idx]) {
            spl.splTsGem = Number(spl.splTsGem);
            spl.splTsCar = this.bepaalAantalCaramboles(spl.splTsGem);
            this.isMatchValid();
        }
        else {
            this.matchValid = false;
        }
        this.hasMatchChanged();
    }

    keyupCaramboles(idx: number) {
        let spl = this.spelers[idx];
        this.carValid[idx] = this.helper.isValidInteger('' + spl.splTsCar);
        if (this.carValid[idx]) {
            spl.splTsCar = Number(spl.splTsCar);
            this.isMatchValid();
        }
        else {
            this.matchValid = false;
        }
        this.hasMatchChanged();
    }

    keyupNaam(idx: number) {
        let spl = this.spelers[idx];
        this.naamValid[idx] = spl.splBordNaam != '';
        if (this.naamValid[idx]) {
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
                this.veranderVanSpeler(event.key ==='ArrowLeft' ? -1 : 1);
                this.setEscapeCount();
                return false;    
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.buttonPressed(this.buttons[1]);
            }
            else {
                this.buttonPressed(this.buttons[2]);
            }
            return false;
        }
        if (event.code === 'KeyR') {
            if (fromInput && (<HTMLInputElement> event.target).id.startsWith('naam')) {
                return false;
            }
            this.buttonPressed(this.buttons[0]);
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
        this.bssApi.getKnbbMatch()
        .then(resp => {
            if (resp.gevonden) {
                this.match = resp.match;
                this.isMatchAlGestart();
                this.bssApi.getMoyenneTabel(this.spelId + '-' + this.match.klasse)
                .then(result => {
                    this.moyTabel = result;
                    this.initBepaalAantalCaramboles();
                    this.copySpelers();
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
        this.matchGestart = this.match.spelers[0].stand.aantBrt > 0;
    }

    private isMatchValid() {
        this.matchValid = this.spelers.every((spl) => {
            return spl.splTsGem > 0 && spl.splTsCar > 0 && spl.splBordNaam != '';
        });
    }

    private hasMatchChanged() {
        this.namesChanged = false;
        this.matchChanged = false;
        if (this.hasWedstrijdChanged()) {
            this.matchChanged = true;
            this.wedStatus = 0;
            this.voortgang = '0%';
        }
        else {
            this.bepaalMatchStatusEnVoortgang();
        }
        if (!this.matchChanged) {
            this.haveNamesChanged();
        }
        this.setEscapeCount();
    }

    private hasWedstrijdChanged(): boolean {
        return this.spelers.some(((spl, idxS) => {
            const origSpl = this.match.spelers[idxS];
            return spl.splId != origSpl.splId || spl.splTsGem != origSpl.splTsGem || spl.splTsCar != origSpl.splTsCar;
        }))
    }

    private haveNamesChanged() {
        this.namesChanged = this.spelers.some((spl, idxS) => {
            const origSpl = this.match.spelers[idxS];
            return spl.splBordNaam != origSpl.splBordNaam;
        });
    }

    private veranderVanSpeler(direction: number) {
        let idx = this.idxSpeler;
        idx += direction;
        if (idx < 0) {
            idx = 1;
        }
        if (idx > 1) {
            idx = 0;
        }
        this.maakSpelerActief(idx);
    }

    private bepaalMatchStatusEnVoortgang(): void {
        // status
        const spl = this.match.spelers[0];
        this.wedStatus = 0;
        if (spl.stand.aantBrt > 0) {
            this.wedStatus = 1;
        }
        if (this.match.matchOver) {
            this.wedStatus = 2;
        }
        // voortgang
        const maxBrt = this.match.maxBeurten;
        let vg = 0;
        const teg = this.match.spelers[1];
        if (this.wedStatus == 0) {
            vg = 0;
        }
        else if (this.wedStatus == 2) {
            vg = 100;
        }
        else {
            vg = Math.max(spl.stand.aantCar / spl.splTsCar, teg.stand.aantCar / teg.splTsCar, (spl.stand.aantBrt + teg.stand.aantBrt) / (2 * maxBrt)) * 100;
        }
        this.voortgang = vg + '%';
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
        this.match.spelers.forEach((spl) => {
            if (spl.splTsCar == 0) {
                spl.splTsCar = this.bepaalAantalCaramboles(spl.splTsGem);
            }
        })
    }

    private clearMatchScores() {
        this.match.matchOver = false;
        this.match.spelers.forEach(spl => {
            spl.isActief = false;
            spl.stand = new MatchSpelerStand();
        });
}

    private copySpelers() {
        this.spelers = JSON.parse(JSON.stringify(this.match.spelers));
        this.matchChanged = false;
    }

    private setEscapeCount() {
        this.escapeCount = (this.idxSpeler >= 0) ? 1 : 0;
    }

    private saveMatchAndContinue() {
        this.bssApi.saveKnbbMatch(this.match)
        .then(() => {
            this.router.navigate(['match']);
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }
}
