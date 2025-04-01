import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { KnbbTeamMatchScoreSpelerComponent } from '../../knbb-team-match/knbb-team-match-score/knbb-team-match-score-speler/knbb-team-match-score-speler.component';
import { NgClass } from '@angular/common';
import { HelperService } from '../../../services/helper.service';
import { SpeechService } from '../../../services/speech.service';
import { Match, MatchSpeler } from '../../../model/match';
import { ModalMessage } from '../../../model/modal-message';
import { HelpComponent } from '../../../shared/help/help.component';
import { SpelerNamen, SpelerNamenDialog } from '../../../model/dialogs';
import { SpelersNamenComponent } from '../../../shared/spelers-namen/spelers-namen.component';

@Component({
    selector: 'app-knbb-match-score',
    standalone: true,
    imports: [
        KnbbTeamMatchScoreSpelerComponent,
        SpelersNamenComponent,
        HelpComponent,
        NgClass
    ],
    templateUrl: './knbb-match-score.component.html',
    styleUrl: './knbb-match-score.component.css'
})
export class KnbbMatchScoreComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);
    spraak = inject(SpeechService);

    match: Match = new Match();
    matchRead: boolean = false;
    idxSpeler: number = -1;
    activeSpeler: MatchSpeler = new MatchSpeler();
    oldPunten: number[] = [0, 0];
    namenDialog: SpelerNamenDialog = new SpelerNamenDialog();
    modals: ModalMessage[] = [];
    modalVisible: boolean = false;
    helpVisible: boolean = false;
    busyCounter: number = 0;
    busy: boolean = false;
    keysLocked: boolean = false;
    testMode: boolean = false;
    testModeToggled: boolean = false;
    speechToggled: boolean = false;

    enterPressed(): void {
        if (this.match.matchOver) {
            return;
        }
        if (this.testMode) {
            this.processEnter();
            return;
        }
        if (!this.keysLocked) {
            this.keysLocked = true;
            setTimeout(() => {
                this.keysLocked = false;
            }, 5000);
            this.processEnter();
        }
    }

    processEnter(): void {
        if (this.match.matchOver) {
            return;
        }
        // werk score bij
        if (this.activeSpeler.stand.serie > 0) {
            const msgToSpeak = 'Genoteerd, ' + this.activeSpeler.splSpreekNaam + ', ' + this.activeSpeler.stand.serie;
            const modalMsg = new ModalMessage('serie', [this.activeSpeler.splBordNaam], msgToSpeak, 3, '' + this.activeSpeler.stand.serie);
            this.modals.push(modalMsg);
            this.showModal();
        }
        else {
            const msgToSpeak = 'Genoteerd, ' + this.activeSpeler.splSpreekNaam + ', 0';
            const modalMsg = new ModalMessage('serie', [this.activeSpeler.splBordNaam], msgToSpeak, 3, '0');
            this.modals.push(modalMsg);
            this.showModal();
        }
        this.activeSpeler.stand.aantCar += this.activeSpeler.stand.serie;
        if (this.activeSpeler.stand.serie > this.activeSpeler.stand.hoogSer) {
            this.activeSpeler.stand.hoogSer = this.activeSpeler.stand.serie;
        }
        this.activeSpeler.stand.score.push(this.activeSpeler.stand.serie);
        if (this.activeSpeler.stand.laatste5brt.length == 5) {
            this.activeSpeler.stand.laatste5brt.shift();
        }
        this.activeSpeler.stand.laatste5brt.push(this.activeSpeler.stand.serie);
        this.activeSpeler.stand.serie = 0;
        this.oldPunten[this.idxSpeler] = this.activeSpeler.stand.punten;
        // check for end of game
        if (this.idxSpeler === 1) {
            if (this.helper.isWedstrijdOver(this.match)) {
                this.match.spelers.forEach((spl) => {
                    spl.stand.punten = this.getPunten(spl);
                });
                this.match.matchOver = true;
                this.match.spelers.forEach(spl => spl.isActief = true);
                this.saveMatch(this.match);
                const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], 'Einde wedstrijd', 3);
                this.modals.push(modalMsg);
                this.showModal();
                this.idxSpeler = -1;
                return;
            }
        }
        // switch actieve speler
        this.activeSpeler.isActief = false;
        this.idxSpeler = Math.abs(this.idxSpeler - 1);
        this.activeSpeler = this.match.spelers[this.idxSpeler];
        this.activeSpeler.isActief = true;
        const copyOfMatch: Match = JSON.parse(JSON.stringify(this.match));
        this.verhoogBeurtenEnBerekenData(this.activeSpeler);
        this.oldPunten[this.idxSpeler] = this.activeSpeler.stand.punten;
        this.checkForSpelerMessages(false, true);
        this.saveMatch(copyOfMatch);
    }

    serieClicked(idx: number): void {
        const nrToAdd = (idx === this.idxSpeler) ? 1 : -1;
        this.addNumberToSerie('' + nrToAdd);
    }

    spelerClicked(idx: number): void {
        if (idx === this.idxSpeler) {
            return;
        }
        this.enterPressed();
    }

    toggleTestMode() {
        this.testModeToggled = true;
        this.testMode = !this.testMode;
        setTimeout(() => {
            this.testModeToggled = false;
        }, 2000);
    }

    toggleSpeech() {
        this.speechToggled = true;
        this.spraak.speechOn = !this.spraak.speechOn;
        setTimeout(() => {
            this.speechToggled = false;
        }, 2000);
    }

    wijzigNamenPressed() {
        this.naamClicked(this.activeSpeler);
    }

    naamClicked(spl: MatchSpeler) {
        this.namenDialog.selSpelerId = spl.splId;
        this.namenDialog.spelers = this.getWedSpelers();
        this.isDialogOpen = true;
    }

    namenDialogReplied(accepted: boolean) {
        if (accepted) {
            this.namenDialog.spelers.forEach(namSpl => {
                let matchSpeler = this.findSpelerById(namSpl.splId);
                if (matchSpeler) {
                    matchSpeler.splBordNaam = namSpl.splBordNaam;
                    matchSpeler.splSpreekNaam = namSpl.splSpreekNaam;
                }
            });
        }
        this.isDialogOpen = false;
    }

    private findSpelerById(id: string): MatchSpeler | undefined {
        return this.match.spelers.find(spl => spl.splId == id);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return false;
        }
        if (this.busy) {
            return false;
        }
        if (this.alert.helpVisible && event.key != 'Shift') {
            this.alert.hideHelp();
            return false;
        }
        if (event.key === 'Escape' || event.key === 'Backspace') {
            this.router.navigate(['match']);
            return false;
        }
        if (event.code === 'KeyN') {
            this.wijzigNamenPressed();
            return false;
        }
        if (event.code === 'KeyS') {
            this.toggleSpeech();
            return false;
        }
        if (event.code === 'KeyT') {
            this.toggleTestMode();
            return false;
        }
        if (event.code === 'KeyH' || event.key === '/' || event.code == 'Slash') {
            this.alert.showHelp();
            return false;
        }
        if (event.code === 'KeyL' || event.key === '*') {
            this.appData.gotoPage(this.router.url, 'match/lijst');
            return false;
        }
        if (event.key === 'Delete' || event.code === 'NumpadDecimal') {
            this.undoLaatsteBeurt();
            return false;
        }
        if (!this.match.matchOver) {
            if (event.key === 'Enter') {
                this.enterPressed();
                return false;
            }
            if (event.key > '0' && event.key <= '9') {
                this.addNumberToSerie(event.key);
                return false;
            }
            if (event.code > 'Numpad0' && event.code <= 'Numpad9') {
                this.addNumberToSerie(event.code.substring(6));
                return false;
            }
            if (event.code === 'Space' || event.key === '+') {
                this.addNumberToSerie('1');
                return false;
            }
            if (event.key === '-') {
                this.addNumberToSerie('-1');
                return false;
            }
            if (event.key === '0' || event.code === 'Numpad0') {
                this.resetInput();
                return false;
            }
        }
        return false;
    }

    resetBusy() {
        this.busy = false;
    }

    ngOnInit(): void {
        this.bssApi.getKnbbMatch()
        .then(resp => {
            if (!resp.gevonden) {
                this.alert.showError('ERROR scorebord : bestand teammatch.json niet gevonden.');
                this.router.navigate(['teammatch']);
                return;
            }
            this.match = resp.match;
            if (this.match.matchOver) {
                this.oldPunten[0] = this.match.spelers[0].stand.punten;
                this.oldPunten[1] = this.match.spelers[1].stand.punten;
                const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], '', 3);
                this.modals.push(modalMsg);
                this.showModal();
            }
            else {
                this.idxSpeler = this.getIndexActieveSpeler(this.match);
                this.activeSpeler = this.match.spelers[this.idxSpeler];
                this.activeSpeler.isActief = true;
                this.verhoogBeurtenEnBerekenData(this.activeSpeler);
                this.oldPunten[0] = this.match.spelers[0].stand.punten;
                this.oldPunten[1] = this.match.spelers[1].stand.punten;
                this.checkForSpelerMessages();
            }
            this.matchRead = true;
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    private addNumberToSerie(numString: string): boolean {
        if (this.keysLocked && !this.testMode) {
            return false;
        }
        let aantBereikt = false;
        const nr = Number(numString);
        if (nr < 0 && this.activeSpeler.stand.serie === 0) {
            return false;
        }
        if ((nr + this.activeSpeler.stand.serie + this.activeSpeler.stand.aantCar) > this.activeSpeler.splTsCar) {
            return false;
        }
        this.activeSpeler.stand.serie += nr;
        if (nr > 0) {
            aantBereikt = this.checkForSpelerMessages(true);
            if (!aantBereikt && !this.testMode) {
                this.keysLocked = true;
                setTimeout(() => {
                    this.keysLocked = false;
                }, 3000);
            }
        }
        this.activeSpeler.stand.gemiddelde = this.getGemiddelde(this.activeSpeler);
        this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
        if (aantBereikt) {
            this.enterPressed();
        }
        return false;
    }

    private checkForSpelerMessages(fromSerie?: boolean, fromEnter?: boolean): boolean {
        let msg: string[] = [];
        let spk = '';
        let msgType = 'info';
        if (!fromSerie) {
            // beurten - alleen checken voor speler 1
            if (this.idxSpeler === 0) {
                const remainingBrt = this.match.maxBeurten - this.activeSpeler.stand.aantBrt;
                if (remainingBrt === 1 && fromEnter) {
                    msg.push('Voorlaatste beurt');
                    spk = 'Voorlaatste beurt';
                }
                if (remainingBrt === 0 && fromEnter) {
                    msg.push('Laatste beurt');
                    spk = 'Laatste beurt';
                }
            }
            if (this.idxSpeler === 1 && fromEnter) {
                if (this.tegenstanderHeeftAantalBereikt(this.idxSpeler)) {
                    msg.push('Gelijkmakende beurt');
                    spk = 'Gelijkmakende beurt';
                }
            }
            const remainingCar = this.activeSpeler.splTsCar - this.activeSpeler.stand.aantCar - this.activeSpeler.stand.serie;
            if (remainingCar > 0 && remainingCar < 4) {
                if (msg.length) {
                    msg.push(`${this.activeSpeler.splBordNaam}, nog ${remainingCar} ...`)
                    spk = spk + `. ${this.activeSpeler.splSpreekNaam}, nog ${remainingCar}.`;    
                }
                else {
                    msg.push(`${this.activeSpeler.splBordNaam}, nog ${remainingCar} ...`);
                    spk = `${this.activeSpeler.splSpreekNaam}, nog ${remainingCar}.`;    
                }
            }
        }
        else {
            // caramboles
            const remainingCar = this.activeSpeler.splTsCar - this.activeSpeler.stand.aantCar - this.activeSpeler.stand.serie;
            if (remainingCar === 0) {
                return true;
            }
            else if (remainingCar < 4) {
                msg.push(`${this.activeSpeler.stand.serie}, en nog ${remainingCar} ...`);
                spk = `${this.activeSpeler.stand.serie}. En nog ${remainingCar}.`;
            }
            else {
                msg.push(`${this.activeSpeler.stand.serie}`);
                spk = `${this.activeSpeler.stand.serie}`;
                msgType = 'carambole';
            }
        }
        if (msg.length) {
            const modalMsg = new ModalMessage(msgType, msg, spk, 3);
            this.modals.push(modalMsg);
            this.showModal();
        }
        return false;
    }

    private undoLaatsteBeurt(): boolean {
        if (this.match.spelers[1].stand.aantBrt == 0) {
            return false;
        }
        let wasGameOver = this.match.matchOver;
        if (this.match.matchOver) {
            this.match.matchOver = false;
            this.idxSpeler = 1;
            this.match.spelers[0].isActief = false;
            this.activeSpeler = this.match.spelers[1];
            this.activeSpeler.isActief = true;
        }
        else {
            // werk beurten en stand huidige speler bij
            this.activeSpeler.stand.aantBrt--;
            this.activeSpeler.stand.serie = 0;
            this.activeSpeler.stand.gemiddelde = this.getGemiddelde(this.activeSpeler);
            this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
            this.oldPunten[this.idxSpeler] = this.activeSpeler.stand.punten;
            // maak vorige speler de huidige speler
            this.activeSpeler.isActief = false;
            this.idxSpeler = Math.abs(this.idxSpeler - 1);
            this.activeSpeler = this.match.spelers[this.idxSpeler];
            this.activeSpeler.isActief = true;
        }
        let laatsteSerie = this.activeSpeler.stand.score.pop();
        if (!laatsteSerie) {
            laatsteSerie = 0;
        }
        this.activeSpeler.stand.serie = laatsteSerie;
        this.activeSpeler.stand.aantCar -= laatsteSerie;
        this.oldPunten[this.idxSpeler] = this.getOldPunten(this.activeSpeler);
        // indien het gameover was werk punten bij van alle spelers
        if (wasGameOver) {
            this.match.spelers.forEach(spl => {
                spl.stand.punten = this.getPunten(spl);
            })
        }
        // werk hoogste serie bij
        if (laatsteSerie == this.activeSpeler.stand.hoogSer && laatsteSerie > 0) {
            let hoogste = 0;
            this.activeSpeler.stand.score.forEach(nr => {
                if (nr > hoogste) {
                    hoogste = nr;
                }
            });
            this.activeSpeler.stand.hoogSer = hoogste;
        }
        // werk laatste 5 beurten bij
        let laatste5: number[] = [];
        let aant = 0;
        for (let i = this.activeSpeler.stand.score.length - 1; i >= 0; i--) {
            laatste5.unshift(this.activeSpeler.stand.score[i]);
            aant++;
            if (aant == 5) {
                break;
            }
        }
        this.activeSpeler.stand.laatste5brt = laatste5;
        const copyOfMatch: Match = JSON.parse(JSON.stringify(this.match));
        let actSpl = copyOfMatch.spelers[this.idxSpeler];
        this.verminderBeurtenEnBerekenData(actSpl);
        this.checkForSpelerMessages();
        this.saveMatch(copyOfMatch);
        return false;
    }

    closeHelp(): void {
        this.helpVisible = false;
    }

    private spelerAantalBereikt(spl: MatchSpeler): boolean {
        return spl.stand.aantCar === spl.splTsCar;
    }

    private verhoogBeurtenEnBerekenData(spl: MatchSpeler): void {
        spl.stand.aantBrt++;
        spl.stand.gemiddelde = this.getGemiddelde(spl);
        spl.stand.punten = this.getPunten(spl);
    }

    private verminderBeurtenEnBerekenData(spl: MatchSpeler): void {
        spl.stand.aantBrt--;
        spl.stand.serie = 0;
        spl.stand.gemiddelde = this.getGemiddelde(spl);
        spl.stand.punten = this.getPunten(spl);
    }

    private eenVanDeSpelersHeeftAantalBereikt(): boolean {
        return this.match.spelers.some((spl) => {
            return this.spelerAantalBereikt(spl);
        });
    }

    private tegenstanderHeeftAantalBereikt(idxSpl: number): boolean {
        const idxTeg = Math.abs(idxSpl - 1);
        const tegenstander = this.match.spelers[idxTeg];
        return this.spelerAantalBereikt(tegenstander);
    }

    private getGemiddelde(spl: MatchSpeler): number {
        if (spl.stand.aantBrt === 0) {
            return 0;
        }
        return (spl.stand.aantCar + spl.stand.serie) / spl.stand.aantBrt;
    }

    private getPunten(spl: MatchSpeler): number {
        let punten = Math.floor(10 * (spl.stand.aantCar + spl.stand.serie) / spl.splTsCar);
        if (spl.stand.gemiddelde > spl.splTsGem) {
            punten += 1;
        }
        return punten;
    }

    private getOldPunten(spl: MatchSpeler): number {
        let gem = (spl.stand.aantBrt === 0) ? 0 : spl.stand.aantCar / spl.stand.aantBrt;
        let punten = Math.floor(10 * spl.stand.aantCar / spl.splTsCar);
        if (gem > spl.splTsGem) {
            punten += 1;
        }
        return punten;
    }

    private resetInput(): boolean {
        this.addNumberToSerie('-' + this.activeSpeler.stand.serie);
        return false;
    }

    private getIndexActieveSpeler(match: Match): number {
        const spl = match.spelers[0];
        const teg = match.spelers[1];
        return (spl.stand.aantBrt == teg.stand.aantBrt) ? 0 : 1;
    }

    private saveMatch(match: Match) {
        this.busy = true;
        this.bssApi.saveKnbbMatch(match)
        .then(() => {
            this.busy = false;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private showModal(): void {
        if (!this.modalVisible) {
            this.modalVisible = true;
            if (this.modals[0].textToSpeak.length) {
                this.spraak.speak(this.modals[0].textToSpeak);
            }
            setTimeout(() => {this.hideModal()}, this.modals[0].duration);
        }
    }

    hideModal(): void {
        if (this.modalVisible) {
            this.modalVisible = false;
            this.modals.shift();
            if (this.modals.length) {
                this.showModal();
            }
        }
    }

    private getWedSpelers(): SpelerNamen[] {
        let result: SpelerNamen[] = [];
        this.match.spelers.forEach(spl => {
            result.push(new SpelerNamen(spl));
        });
        return result;
    }

}
