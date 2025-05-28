import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { Annonceer, AnnonSpeler, AnnonSerie } from '../../model/annonceer';
import { NgClass } from '@angular/common';
import { AnnonScoreSpelerLandscapeComponent } from "./annon-score-speler-landscape/annon-score-speler-landscape.component";
import { AnnonScoreSpelerComponent } from "./annon-score-speler/annon-score-speler.component";
import { SpeechService } from '../../services/speech.service';
import { AlertService } from '../../services/alert.service';
import { SpelerNamen, SpelerNamenDialog } from '../../model/dialogs';
import { ModalMessage } from '../../model/modal-message';
import { SpelersNamenComponent } from '../spelers-namen/spelers-namen.component';
import { HelpComponent } from '../help/help.component';

@Component({
    selector: 'app-annon-score',
    standalone: true,
    imports: [
        NgClass,
        SpelersNamenComponent,
        HelpComponent,
        AnnonScoreSpelerLandscapeComponent,
        AnnonScoreSpelerComponent
    ],
    templateUrl: './annon-score.component.html',
    styleUrl: './annon-score.component.css'
})
export class AnnonScoreComponent implements OnInit {
    spraak = inject(SpeechService);
    alert = inject(AlertService);

    @Input() wedstrijd: Annonceer = new Annonceer();
    @Output() opslaan: EventEmitter<Annonceer> = new EventEmitter<Annonceer>();
    @Output() keyPressed: EventEmitter<string> = new EventEmitter<string>();

    activeSpeler: AnnonSpeler = new AnnonSpeler(0);
    namenDialog: SpelerNamenDialog = new SpelerNamenDialog();
    modals: ModalMessage[] = [];
    idxTeam: number = -1;
    idxSpeler: number = -1;
    modalVisible: boolean = false;
    keysLocked: boolean = false;
    testMode: boolean = false;
    testModeToggled: boolean = false;
    speechToggled: boolean = false;
    isDialogOpen: boolean = false;

    enterPressed(): void {
        if (this.wedstrijd.wedGespeeld) {
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

    processEnter() {
        const ser = this.getSpelerSerieTotaal(this.activeSpeler);
        if (ser > 0) {
            const msgToSpeak = 'Genoteerd, ' + this.activeSpeler.splSpreekNaam + ', ' + ser;
            const modalMsg = new ModalMessage('serie', [this.activeSpeler.splBordNaam], msgToSpeak, 4, '' + ser);
            this.modals.push(modalMsg);
            this.showModal();
        }
        else {
            const msgToSpeak = 'Genoteerd, ' + this.activeSpeler.splSpreekNaam + ', 0';
            const modalMsg = new ModalMessage('serie', [this.activeSpeler.splBordNaam], msgToSpeak, 4, '0');
            this.modals.push(modalMsg);
            this.showModal();
        }
    }

    followUpEnter() {
        this.werkScoreSpelerBij(this.activeSpeler);
        this.activeSpeler.stand.scores.push(this.activeSpeler.stand.serie);
        this.activeSpeler.stand.serie = new AnnonSerie(this.wedstrijd.config.cats.length);
        // check for einde wedstrijd
        if (this.isWedstrijdOver()) {
            this.wedstrijd.wedGespeeld = true;
            this.wedstrijd.spelers.forEach(spl => spl.actief = true);
            this.idxSpeler = -1;
            const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], 'Einde wedstrijd', 3);
            this.modals.push(modalMsg);
            this.showModal();
            this.opslaan.emit(this.wedstrijd);
            return;
        }
        // switch actieve speler
        this.activeSpeler.actief = false;
        this.idxSpeler++;
        if (this.idxSpeler >= this.wedstrijd.config.aantSpelers) {
            this.idxSpeler = 0;
        }
        this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
        this.activeSpeler.actief = true;

        const copyOfWedstrijd: Annonceer = JSON.parse(JSON.stringify(this.wedstrijd));
        this.activeSpeler.stand.aantBrt++;
        this.opslaan.emit(copyOfWedstrijd);
    }

    wijzigNamenPressed() {
        this.naamClicked(this.activeSpeler);
    }

    naamClicked(spl: AnnonSpeler) {
        this.namenDialog.selSpelerId = spl.splId;
        this.namenDialog.spelers = this.getAnnonSpelers();
        this.isDialogOpen = true;
    }

    namenDialogReplied(accepted: boolean) {
        if (accepted) {
            this.namenDialog.spelers.forEach(namSpl => {
                let wedSpeler = this.findSpelerById(namSpl.splId);
                if (wedSpeler) {
                    wedSpeler.splBordNaam = namSpl.splBordNaam;
                    wedSpeler.splSpreekNaam = namSpl.splSpreekNaam;
                }
            });
        }
        this.isDialogOpen = false;
    }

    private findSpelerById(id: string): AnnonSpeler | undefined {
        return this.wedstrijd.spelers.find(spl => spl.splId == id);
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

    @HostListener('document:keydown', ['$event'])
    handleKeydownEvent(event: KeyboardEvent): boolean {
        if (event.code == 'F5') {
            event.preventDefault();
        }
        return true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event);
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return false;
        }
        if (this.alert.helpVisible && event.key != 'Shift') {
            this.alert.hideHelp();
            return false;
        }        
        if (event.key === 'Escape' || event.key === 'Backspace') {
            this.keyPressed.emit('Escape');
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
        if (event.key === 'Delete' || event.code === 'NumpadSubtract') {
            this.undoLaatsteBeurt();
            return false;
        }
        if (!this.wedstrijd.wedGespeeld) {
            if (event.key === 'Enter' || event.key == 'PageDown') {
                this.enterPressed();
                return false;
            }
            if (event.code == 'Numpad7' || event.code == 'Digit1') {
                this.addToSerie(0);
                return false;
            }
            if (event.code == 'Numpad4' || event.code == 'Digit2') {
                this.addToSerie(1);
                return false;
            }
            if (event.code == 'Numpad1' || event.code == 'Digit3') {
                this.addToSerie(2);
                return false;
            }
            if (event.code == 'Numpad0' || event.code == 'Digit4') {
                this.addToSerie(3);
                return false;
            }
            if (event.code == 'Numpad9' || event.code == 'Digit6') {
                this.removeFromSerie(0);
                return false;
            }
            if (event.code == 'Numpad6' || event.code == 'Digit7') {
                this.removeFromSerie(1);
                return false;
            }
            if (event.code == 'Numpad3' || event.code == 'Digit8') {
                this.removeFromSerie(2);
                return false;
            }
            if (event.code == 'NumpadDecimal' || event.code == 'Digit9') {
                this.removeFromSerie(3);
                return false;
            }
        }
        return true;
    }

    ngOnInit(): void {
        if (this.wedstrijd.wedGespeeld) {
            const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], '', 3);
            this.modals.push(modalMsg);
            this.showModal();
            return;
        }
        this.setActiveSpeler();
        this.activeSpeler.stand.aantBrt++;
    }

    private addToSerie(idxCat: number): boolean {
        if (this.keysLocked && !this.testMode) {
            return false;
        }
        let msgType = 'info';
        let msg = this.wedstrijd.config.cats[idxCat].naam;
        let spk = this.wedstrijd.config.cats[idxCat].spkNaam;
        const aantal = this.activeSpeler.stand.totaal.cars[idxCat] + this.activeSpeler.stand.serie.cars[idxCat];
        if (aantal < this.activeSpeler.splTsCar) {
            this.activeSpeler.stand.serie.cars[idxCat]++;
            msg += (aantal < this.activeSpeler.splTsCar - 1) ? ' - totaal ' + (aantal + 1) : ' is vol';
            spk += (aantal < this.activeSpeler.splTsCar - 1) ? ', totaal ' + (aantal + 1) : ', is vol';
        }
        else {
            msg += ' is al vol';
            spk += ' is al vol';
        }

        const modalMsg = new ModalMessage(msgType, [msg], spk, 3);
        this.modals.push(modalMsg);
        this.showModal();
        if (this.spelerHeeftAllesVol(this.activeSpeler)) {
            this.enterPressed();
        }
        else {

            if (!this.testMode) {
                this.keysLocked = true;
                setTimeout(() => {
                    this.keysLocked = false;
                }, 3000);
            }
        }
        return false;
    }

    private removeFromSerie(idxCat: number): boolean {
        if (this.keysLocked && !this.testMode) {
            return false;
        }
        if (this.activeSpeler.stand.serie.cars[idxCat] > 0) {
            this.activeSpeler.stand.serie.cars[idxCat]--;
        }
        return false;
    }

    private undoLaatsteBeurt(): boolean {
        if (this.wedstrijd.spelers[1].stand.aantBrt === 0) {
            return false;
        }    
        const wasWedOver = this.wedstrijd.wedGespeeld;
        if (this.wedstrijd.wedGespeeld) {
            this.wedstrijd.wedGespeeld = false;
            // alle spelers zijn actief dus allen inactiveren behalve de laatse; die blijft actief
            this.wedstrijd.spelers.forEach(spl => {
                spl.actief = false;
            });
            this.idxSpeler = this.wedstrijd.config.aantSpelers - 1;
            this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.activeSpeler.actief = true;
        }
        else {
            // werk beurten en stand huidige speler bij
            this.activeSpeler.stand.aantBrt--;
            this.activeSpeler.stand.serie = new AnnonSerie(this.wedstrijd.config.cats.length);
            // if (this.wedstrijd.telling.idxOptie == 0) {
            //     this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
            //     this.oldPunten[this.idxSpeler] = this.activeSpeler.stand.punten;
            // }
            // maak vorige speler de huidige speler
            this.activeSpeler.actief = false;
            this.idxSpeler--;
            if (this.idxSpeler < 0) {
                this.idxSpeler = this.wedstrijd.config.aantSpelers - 1;
            }
            this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.activeSpeler.actief = true;    
        }
        let laatsteSerie = this.activeSpeler.stand.scores.pop();
        if (!laatsteSerie) {
            laatsteSerie = new AnnonSerie(this.wedstrijd.config.cats.length);
        }
        this.activeSpeler.stand.serie = laatsteSerie;
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
            this.activeSpeler.stand.totaal.cars[i] -= laatsteSerie.cars[i];
        }
        this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
        // if (this.wedstrijd.telling.idxOptie == 0) {
        //     this.oldPunten[this.idxSpeler] = this.getOldPunten(this.activeSpeler);
        // }
        // indien het gameover was werk punten bij van alle spelers
        if (wasWedOver) {
            // this.wedstrijd.spelers.forEach(spl => {
            //     spl.stand.punten = this.getPunten(spl);
            // });
        }
        const copyOfWedstrijd: Annonceer = JSON.parse(JSON.stringify(this.wedstrijd));
        let actSpl = copyOfWedstrijd.spelers[this.idxSpeler];
        actSpl.stand.aantBrt--;
        //this.checkForMessages();
        this.opslaan.emit(copyOfWedstrijd);
        return false;
    }

    private isWedstrijdOver(): boolean {
        if (this.idxSpeler < this.wedstrijd.config.aantSpelers - 1) {
            if (this.wedstrijd.spelers.some(spl => this.spelerHeeftAllesVol(spl))) {
                const msg = 'Gelijkmakende beurt';
                const modalMsg = new ModalMessage('info', [msg], msg, 3);
                this.modals.push(modalMsg);
                this.showModal();
            }
            return false;
        }
        // de actieve speler is nu dus de laatste speler
        if (this.activeSpeler.stand.aantBrt === 999) {
            return true;
        }
        return this.wedstrijd.spelers.some(spl => this.spelerHeeftAllesVol(spl));
    }

    private werkScoreSpelerBij(speler: AnnonSpeler) {
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
           speler.stand.totaal.cars[i] += speler.stand.serie.cars[i];
        }
        speler.stand.punten = this.getPunten(speler);
    }

    private getPunten(speler: AnnonSpeler): number {
        let result = 0;
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
            if (speler.stand.totaal.cars[i] == speler.splTsCar) {
                result++;
            }
        }
        if (result == 4) {
            result++;
        }
        return result;
    }

    private getSpelerSerieTotaal(speler: AnnonSpeler): number {
        let result = 0;
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
            result += speler.stand.serie.cars[i];
        }
        return result;
    }

    private spelerHeeftAllesVol(speler: AnnonSpeler): boolean {
        return this.wedstrijd.config.cats.every((cat, idx) => {
            return speler.stand.totaal.cars[idx] + speler.stand.serie.cars[idx] == speler.splTsCar;
        });
    }

    private setActiveSpeler() {
        this.idxSpeler = this.wedstrijd.spelers.findIndex(spl => spl.actief);
        this.idxSpeler = (this.idxSpeler < 0) ? 0 : this.idxSpeler;
        this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
        this.activeSpeler.actief = true;    
    }

    private getAnnonSpelers(): SpelerNamen[] {
        let result: SpelerNamen[] = [];
        this.wedstrijd.spelers.forEach(spl => {
            result.push(new SpelerNamen(spl));
        });
        return result;
    }

    private showModal(): void {
        if (!this.modalVisible) {
            this.modalVisible = true;
            if (this.modals[0].textToSpeak.length) {
                this.spraak.speak(this.modals[0].textToSpeak);
            }
            setTimeout(() => {
                if (this.modals[0].type == 'serie') {
                    this.followUpEnter();
                }
                this.hideModal();
            }, this.modals[0].duration);
        }
    }

    hideModal(): void {
        if (this.modalVisible) {
            this.modalVisible = false;
            this.modals.shift();
            if (this.modals.length) {
                this.showModal();
            }
            else if (this.wedstrijd.wedGespeeld) {
                this.idxSpeler = -1;
                this.keyPressed.emit('Ready');
            }
        }
    }

}
