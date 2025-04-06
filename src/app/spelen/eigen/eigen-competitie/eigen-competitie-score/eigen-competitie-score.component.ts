import { Component, HostListener, inject, OnInit } from '@angular/core';
import { SpelersNamenComponent } from '../../../../shared/spelers-namen/spelers-namen.component';
import { NgClass } from '@angular/common';
import { HelpComponent } from '../../../../shared/help/help.component';
import { EigenCompetitieScoreSpelerComponent } from './eigen-competitie-score-speler/eigen-competitie-score-speler.component';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../../../services/helper.service';
import { SpeechService } from '../../../../services/speech.service';
import { CmpMatchSpeler, CmpSpeler, CmpSplWedstrijd, Competitie, CompetitieMatch } from '../../../../model/competitie';
import { ConfirmEndOfMatchDialog, SpelerNamen, SpelerNamenDialog } from '../../../../model/dialogs';
import { ModalMessage } from '../../../../model/modal-message';
import { ConfirmEndOfMatchComponent } from '../../../../shared/confirm-end-of-match/confirm-end-of-match.component';

@Component({
    selector: 'app-eigen-competitie-score',
    standalone: true,
    imports: [
        EigenCompetitieScoreSpelerComponent,
        SpelersNamenComponent,
        ConfirmEndOfMatchComponent,
        NgClass,
        HelpComponent
    ],
    templateUrl: './eigen-competitie-score.component.html',
    styleUrl: './eigen-competitie-score.component.css'
})
export class EigenCompetitieScoreComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);
    spraak = inject(SpeechService);

    comp: Competitie = new Competitie('');
    match: CompetitieMatch = new CompetitieMatch();
    matchRead: boolean = false;
    idxSpl: number = -1;
    idxTeg: number = -1;
    idxRonde: number = -1;
    maxBeurten: number = 0;
    prevUrl: string = '';
    idxSpeler: number = -1;
    activeSpeler: CmpMatchSpeler = new CmpMatchSpeler(new CmpSpeler(1), true);
    oldPunten: number[] = [0, 0];
    namenDialog: SpelerNamenDialog = new SpelerNamenDialog();
    endOfMatchDialog: ConfirmEndOfMatchDialog = new ConfirmEndOfMatchDialog();
    isEndOfMatchDialogOpen: boolean = false;
    modals: ModalMessage[] = [];
    modalVisible: boolean = false;
    helpVisible: boolean = false;
    busyCounter: number = 0;
    busy: boolean = false;
    keysLocked: boolean = false;
    testMode: boolean = false;
    testModeToggled: boolean = false;
    speechToggled: boolean = false;

    override escapePressed(): void {
        if (this.match.matchOver && !this.match.opgeslagen) {
            this.isEndOfMatchDialogOpen = true;
            return;
        }
        this.router.navigate([this.prevUrl]);
    }

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
            const msgToSpeak = 'Genoteerd, ' + this.activeSpeler.spreekNaam + ', ' + this.activeSpeler.stand.serie;
            const modalMsg = new ModalMessage('serie', [this.activeSpeler.bordNaam], msgToSpeak, 3, '' + this.activeSpeler.stand.serie);
            this.modals.push(modalMsg);
            this.showModal();
        }
        else {
            const msgToSpeak = 'Genoteerd, ' + this.activeSpeler.spreekNaam + ', 0';
            const modalMsg = new ModalMessage('serie', [this.activeSpeler.bordNaam], msgToSpeak, 3, '0');
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
        // check for end of match
        if (this.idxSpeler === 1) {
            if (this.helper.isEigenMatchOver(this.match)) {
                this.match.spelers.forEach((spl, idx) => {
                    spl.stand.punten = this.getPunten(spl, idx);
                });
                this.match.matchOver = true;
                this.match.spelers.forEach(spl => spl.active = true);
                this.match.datum = new Date().toISOString().substring(0, 10);
                this.saveMatch(this.match);
                const modalMsg = new ModalMessage('success', [''], 'Einde wedstrijd', 3);
                this.modals.push(modalMsg);
                this.showModal();
                this.idxSpeler = -1;
                this.isEndOfMatchDialogOpen = true;
                return;
            }
        }
        // switch actieve speler
        this.activeSpeler.active = false;
        this.idxSpeler = Math.abs(this.idxSpeler - 1);
        this.activeSpeler = this.match.spelers[this.idxSpeler];
        this.activeSpeler.active = true;
        const copyOfMatch: CompetitieMatch = JSON.parse(JSON.stringify(this.match));
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

    naamClicked(spl: CmpMatchSpeler) {
        this.namenDialog.selSpelerId = spl.id;
        this.namenDialog.spelers = this.getWedSpelers();
        console.log(this.namenDialog);
        this.isDialogOpen = true;
    }

    namenDialogReplied(accepted: boolean) {
        if (accepted) {
            this.namenDialog.spelers.forEach(namSpl => {
                let matchSpeler = this.findSpelerById(namSpl.splId);
                if (matchSpeler) {
                    matchSpeler.bordNaam = namSpl.splBordNaam;
                    matchSpeler.spreekNaam = namSpl.splSpreekNaam;
                }
            });
        }
        this.isDialogOpen = false;
    }

    endOfMatchDialogReplied(accepted: boolean) {
        if (accepted) {
            this.matchToevoegenAanComp();
        }
        this.isEndOfMatchDialogOpen = false;
    }

    private findSpelerById(id: string): CmpMatchSpeler | undefined {
        return this.match.spelers.find(spl => spl.id == id);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydownEvent(event: KeyboardEvent): boolean {
        if (event.code == 'F5') {
            event.preventDefault();
        }
        return true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen || this.isEndOfMatchDialogOpen) {
            return false;
        }
        if (this.busy) {
            return false;
        }
        if (this.alert.helpVisible && event.key != 'Shift') {
            this.alert.hideHelp();
            return false;
        }
        if (event.key === 'Escape' || event.key === 'Backspace' || event.code == 'F5') {
            if (this.activeSpeler.stand.serie > 0) {
                this.addNumberToSerie('-1');
            }
            else {
                this.escapePressed();
            }
            return false;
        }
        if (event.code === 'KeyN') {
            this.wijzigNamenPressed();
            return false;
        }
        if (event.code === 'KeyT') {
            this.toggleTestMode();
            return false;
        }
        if (event.code === 'KeyS') {
            this.toggleSpeech();
            return false;
        }
        if (event.code === 'KeyH' || event.key === '/' || event.code == 'Slash') {
            this.alert.showHelp();
            return false;
        }
        if (event.key === 'Delete' || event.code === 'NumpadDecimal' || event.code == 'Period') {
            this.undoLaatsteBeurt();
            return false;
        }
        if (!this.match.matchOver) {
            if (event.key === 'Enter' || event.key == 'PageDown') {
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
            if (event.code === 'Space' || event.key === '+' || event.key == 'PageUp') {
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
        const naam: string | null = this.route.snapshot.paramMap.get('naam');
        if (!naam) {
            this.alert.showAlert('De competitienaam in de URL is niet geldig.', 'error');
            return;
        }
        const ronde: string | null = this.route.snapshot.paramMap.get('ronde');
        this.idxRonde = (ronde && this.helper.isValidIntegerOrZero(ronde)) ? +ronde : -1;
        const idxS: string | null = this.route.snapshot.paramMap.get('idxspl');
        this.idxSpl = (idxS && this.helper.isValidIntegerOrZero(idxS)) ? +idxS : -1;
        const idxT: string | null = this.route.snapshot.paramMap.get('idxteg');
        this.idxTeg = (idxT && this.helper.isValidIntegerOrZero(idxT)) ? +idxT : -1;
        if (this.idxRonde < 0 || this.idxSpl < 0 || this.idxTeg < 0 || this.idxSpl == this.idxTeg) {
            this.alert.showAlert('De match parameters in de URL zijn niet geldig.', 'error');
            return;
        }
        this.prevUrl = this.router.url.replace('score', 'match');
        Promise.all([
            this.bssApi.getCompetitie(naam),
            this.bssApi.getEigenMatch()
        ])
        .then(results => {
            if (!results[0].gevonden) {
                this.alert.showError(`Competitiebestand '${naam}.json' niet gevonden.`);
                this.router.navigate([this.prevUrl]);
                return;
            }
            if (!results[1].gevonden) {
                this.alert.showError('ERROR scorebord : bestand eigenmatch.json niet gevonden.');
                this.router.navigate([this.prevUrl]);
                return;
            }
            this.comp = results[0].comp;
            this.match = results[1].match;
            if (this.matchAanwezigInComp()) {
                this.router.navigate([this.prevUrl]);
                return;
            }
            this.maxBeurten = (this.match.regels.maxBeurten > 0) ? this.match.regels.maxBeurten : 100;
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
                this.activeSpeler.active = true;
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
        if (this.match.regels.idxOptie != 1) {
            if ((nr + this.activeSpeler.stand.serie + this.activeSpeler.stand.aantCar) > this.activeSpeler.tsCar) {
                return false;
            }    
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
        if (this.match.telling.idxOptie == 0) {
            this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
        }
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
                const remainingBrt = this.maxBeurten - this.activeSpeler.stand.aantBrt;
                if (remainingBrt === 1 && fromEnter) {
                    msg.push('Voorlaatste beurt');
                    spk = 'Voorlaatste beurt';
                }
                if (remainingBrt === 0 && fromEnter) {
                    msg.push('Laatste beurt');
                    spk = 'Laatste beurt';
                }
            }
            if (this.match.regels.idxOptie != 1) {
                if (this.idxSpeler === 1 && fromEnter) {
                    if (this.tegenstanderHeeftAantalBereikt(this.idxSpeler)) {
                        msg.push('Gelijkmakende beurt');
                        spk = 'Gelijkmakende beurt';
                    }
                }
                const remainingCar = this.activeSpeler.tsCar - this.activeSpeler.stand.aantCar - this.activeSpeler.stand.serie;
                if (remainingCar > 0 && remainingCar < 4) {
                    if (msg.length) {
                        msg.push(`${this.activeSpeler.bordNaam}, nog ${remainingCar} ...`)
                        spk = spk + `. ${this.activeSpeler.spreekNaam}, nog ${remainingCar}.`;    
                    }
                    else {
                        msg.push(`${this.activeSpeler.bordNaam}, nog ${remainingCar} ...`);
                        spk = `${this.activeSpeler.spreekNaam}, nog ${remainingCar}.`;    
                    }
                }    
            }
        }
        else {
            // caramboles
            if (this.match.regels.idxOptie != 1) {
                const remainingCar = this.activeSpeler.tsCar - this.activeSpeler.stand.aantCar - this.activeSpeler.stand.serie;
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
            this.match.opgeslagen = false;
            this.idxSpeler = 1;
            this.match.spelers[0].active = false;
            this.activeSpeler = this.match.spelers[1];
            this.activeSpeler.active = true;
        }
        else {
            // werk beurten en stand huidige speler bij
            this.activeSpeler.stand.aantBrt--;
            this.activeSpeler.stand.serie = 0;
            this.activeSpeler.stand.gemiddelde = this.getGemiddelde(this.activeSpeler);
            if (this.match.telling.idxOptie == 0) {
                this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
                this.oldPunten[this.idxSpeler] = this.activeSpeler.stand.punten;
            }
            // maak vorige speler de huidige speler
            this.activeSpeler.active = false;
            this.idxSpeler = Math.abs(this.idxSpeler - 1);
            this.activeSpeler = this.match.spelers[this.idxSpeler];
            this.activeSpeler.active = true;
        }
        let laatsteSerie = this.activeSpeler.stand.score.pop();
        if (!laatsteSerie) {
            laatsteSerie = 0;
        }
        this.activeSpeler.stand.serie = laatsteSerie;
        this.activeSpeler.stand.aantCar -= laatsteSerie;
        if (this.match.telling.idxOptie == 0) {
            this.oldPunten[this.idxSpeler] = this.getOldPunten(this.activeSpeler);
        }
        // indien het gameover was werk punten bij van alle spelers
        if (wasGameOver && this.match.telling.idxOptie == 0) {
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
        const copyOfMatch: CompetitieMatch = JSON.parse(JSON.stringify(this.match));
        let actSpl = copyOfMatch.spelers[this.idxSpeler];
        this.verminderBeurtenEnBerekenData(actSpl);
        this.checkForSpelerMessages();
        this.saveMatch(copyOfMatch);
        return false;
    }

    closeHelp(): void {
        this.helpVisible = false;
    }

    private spelerAantalBereikt(spl: CmpMatchSpeler): boolean {
        return spl.stand.aantCar === spl.tsCar;
    }

    private verhoogBeurtenEnBerekenData(spl: CmpMatchSpeler): void {
        spl.stand.aantBrt++;
        spl.stand.gemiddelde = this.getGemiddelde(spl);
        if (this.match.telling.idxOptie == 0) {
            spl.stand.punten = this.getPunten(spl);
        }
    }

    private verminderBeurtenEnBerekenData(spl: CmpMatchSpeler): void {
        spl.stand.aantBrt--;
        spl.stand.serie = 0;
        spl.stand.gemiddelde = this.getGemiddelde(spl);
        if (this.match.telling.idxOptie == 0) {
            spl.stand.punten = this.getPunten(spl);
        }
    }

    private matchAanwezigInComp(): boolean {
        const cmpSpl = this.comp.cmpSpelers[this.idxSpl];
        const teg = this.match.spelers[1];
        return cmpSpl.splRondes[this.idxRonde].wedstrijden.some(wed => wed.tegId == teg.id);
    }

    private tegenstanderHeeftAantalBereikt(idxSpl: number): boolean {
        const idxTeg = Math.abs(idxSpl - 1);
        const tegenstander = this.match.spelers[idxTeg];
        return this.spelerAantalBereikt(tegenstander);
    }

    private getGemiddelde(spl: CmpMatchSpeler): number {
        if (spl.stand.aantBrt === 0) {
            return 0;
        }
        return (spl.stand.aantCar + spl.stand.serie) / spl.stand.aantBrt;
    }

    private getPunten(spl: CmpMatchSpeler, idx?: number): number {
        let punten = 0;
        if (this.match.telling.idxOptie == 0) {
            punten = Math.floor(10 * (spl.stand.aantCar + spl.stand.serie) / spl.tsCar);
        }
        else {
            if (idx != undefined && idx != null) {
                let teg = this.match.spelers[Math.abs(idx - 1)];
                if (this.match.regels.idxOptie == 1) {
                    if ((spl.stand.gemiddelde / spl.tsMoy) > (teg.stand.gemiddelde / teg.tsMoy)) {
                        punten = this.match.telling.winstPunten;
                    }
                    else if ((spl.stand.gemiddelde / spl.tsMoy) == (teg.stand.gemiddelde / teg.tsMoy)) {
                        punten = this.match.telling.gelijkPunten;
                    }
                    else {
                        punten = 0;
                    }
                }
                else {
                    if (spl.stand.aantCar == spl.tsCar || teg.stand.aantCar == teg.tsCar) {
                        if (spl.stand.aantCar == spl.tsCar && teg.stand.aantCar == teg.tsCar) {
                            punten = this.match.telling.gelijkPunten;
                        }
                        else {
                            punten = (spl.stand.aantCar == spl.tsCar) ? this.match.telling.winstPunten : 0
                        }
                    }
                    else {
                        if ((spl.stand.aantCar / spl.tsCar) > (teg.stand.aantCar / teg.tsCar)) {
                            punten = this.match.telling.winstPunten;
                        }
                        else if ((spl.stand.aantCar / spl.tsCar) == (teg.stand.aantCar / teg.tsCar)) {
                            punten = this.match.telling.gelijkPunten;
                        }
                        else {
                            punten = 0;
                        }    
                    }
                }
            }
        }
        if (spl.stand.gemiddelde > spl.tsMoy) {
            punten += this.match.telling.bovenMoyPunten;
        }
        return punten;
    }

    private getOldPunten(spl: CmpMatchSpeler): number {
        let gem = (spl.stand.aantBrt === 0) ? 0 : spl.stand.aantCar / spl.stand.aantBrt;
        let punten = Math.floor(10 * spl.stand.aantCar / spl.tsCar);
        if (gem > spl.tsMoy) {
            punten += this.match.telling.bovenMoyPunten;
        }
        return punten;
    }

    private resetInput(): boolean {
        this.addNumberToSerie('-' + this.activeSpeler.stand.serie);
        return false;
    }

    private getIndexActieveSpeler(match: CompetitieMatch): number {
        const spl = match.spelers[0];
        const teg = match.spelers[1];
        return (spl.stand.aantBrt == teg.stand.aantBrt) ? 0 : 1;
    }

    private saveMatch(match: CompetitieMatch) {
        this.busy = true;
        this.bssApi.saveEigenMatch(match)
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
            result.push(new SpelerNamen(null, spl));
        });
        return result;
    }

    private matchToevoegenAanComp() {
        this.match.spelers.forEach((spl, idx) => {
            const idxCmpSpl = (idx == 0) ? this.idxSpl : this.idxTeg;
            const idxCmpTeg = (idx == 0) ? this.idxTeg : this.idxSpl;
            let cmpSpl = this.comp.cmpSpelers[idxCmpSpl];
            let cmpTeg = this.comp.cmpSpelers[idxCmpTeg];
            let wed = new CmpSplWedstrijd();
            wed.wedOver = true;
            wed.datum = this.match.datum;
            wed.tegId = this.match.spelers[Math.abs(idx - 1)].id;
            wed.tegNaam = this.match.spelers[Math.abs(idx - 1)].naam;
            wed.metWit = spl.metWit;
            wed.aantCar = spl.stand.aantCar;
            wed.aantBrt = spl.stand.aantBrt;
            wed.hoogSer = spl.stand.hoogSer;
            wed.aantPnt = spl.stand.punten;
            wed.scores = spl.stand.score;
            const idxWed = cmpSpl.splRondes[this.idxRonde].wedstrijden.findIndex(w => w.tegId == cmpTeg.splId);
            if (idxWed < 0) {
                cmpSpl.splRondes[this.idxRonde].wedstrijden.push(wed);
            }
            else {
                cmpSpl.splRondes[this.idxRonde].wedstrijden[idxWed] = wed;
            }
        });
        this.bssApi.saveCompetitie(this.comp)
        .then(resp => {
            this.match.opgeslagen = true;
            this.saveMatch(this.match);
            this.isEndOfMatchDialogOpen = false;
            this.alert.showAlert(`Uitslag ${this.match.spelers[0].bordNaam} - ${this.match.spelers[1].bordNaam} opgeslagen in competitie.`, 'success');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

}
