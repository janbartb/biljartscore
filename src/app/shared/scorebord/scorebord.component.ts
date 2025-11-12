import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { SpeechService } from '../../services/speech.service';
import { AlertService } from '../../services/alert.service';
import { WedSpeler, Wedstrijd, WedTeam } from '../../model/wedstrijd';
import { NgClass } from '@angular/common';
import { ScorebordSpelerComponent } from "./scorebord-speler/scorebord-speler.component";
import { SpelerNamen, SpelerNamenDialog } from '../../model/dialogs';
import { ModalMessage } from '../../model/modal-message';
import { Message } from '../../model/message';
import { ScorebordSpelerLandscapeComponent } from './scorebord-speler-landscape/scorebord-speler-landscape.component';
import { ScorebordTeamComponent } from './scorebord-team/scorebord-team.component';
import { SpelersNamenComponent } from '../spelers-namen/spelers-namen.component';
import { HelpScoreComponent } from '../help-score/help-score.component';
import { Apparaat, Config } from '../../model/config';
import { StatusService } from '../../services/status.service';
import { HelperService } from '../../services/helper.service';
import { NotificationComponent } from '../notification/notification.component';

class ActieToetsen {
    beurtPlus: string[] = [];
    beurtMin: string[] = [];
    seriePlus: string[] = [];
    serieMin: string[] = [];
}

@Component({
    selector: 'app-scorebord',
    standalone: true,
    imports: [
        NgClass,
        ScorebordSpelerComponent,
        ScorebordSpelerLandscapeComponent,
        ScorebordTeamComponent,
        NotificationComponent,
        SpelersNamenComponent,
        HelpScoreComponent
    ],
    templateUrl: './scorebord.component.html',
    styleUrl: './scorebord.component.css'
})
export class ScorebordComponent implements OnInit {
    spraak = inject(SpeechService);
    alert = inject(AlertService);
    appData = inject(StatusService);
    helper = inject(HelperService);

    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
    @Output() opslaan: EventEmitter<Wedstrijd> = new EventEmitter<Wedstrijd>();
    @Output() keyPressed: EventEmitter<string> = new EventEmitter<string>();

    idxSpeler: number = -1;
    idxTeam: number = -1;
    actieveSpeler: WedSpeler = new WedSpeler();
    actieveTeam: WedTeam = new WedTeam();
    aantBereikt: boolean = false;
    toetsen: ActieToetsen = new ActieToetsen();
    namenDialog: SpelerNamenDialog = new SpelerNamenDialog();
    modals: ModalMessage[] = [];
    modalVisible: boolean = false;
    textsToSpeak: string[] = [];
    isDialogOpen: boolean = false;
    oldPunten: number[] = [0, 0, 0, 0];
    oldHoogSer: number[] = [0, 0, 0, 0];
    keysLocked: boolean = false;
    testMode: boolean = false;
    testModeToggled: boolean = false;
    speechToggled: boolean = false;
    repeatRemaining: boolean = false;
    sayGenoteerd: boolean = false;

    enterPressed() {
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
        // werk score bij
        const notif = [this.actieveSpeler.splBordNaam, '' + this.actieveSpeler.stand.serie];
        const msgToSpeak = (this.sayGenoteerd ? 'Genoteerd, ' : '') + this.actieveSpeler.splSpreekNaam + ', ' + this.actieveSpeler.stand.serie;
        const modalMsg = new ModalMessage('noteer', notif, msgToSpeak, 4);
        this.modals.push(modalMsg);
        this.showModal();
        this.actieveSpeler.stand.aantCar += this.actieveSpeler.stand.serie;
        if (this.actieveSpeler.stand.serie > this.actieveSpeler.stand.hoogSer) {
            this.actieveSpeler.stand.hoogSer = this.actieveSpeler.stand.serie;
        }
        this.actieveSpeler.stand.score.push(this.actieveSpeler.stand.serie);
        let laatste5 = this.actieveSpeler.stand.laatste5brt.slice();
        if (laatste5.length == 5) {
            laatste5.shift();
        }
        laatste5.push(this.actieveSpeler.stand.serie);
        this.actieveSpeler.stand.laatste5brt = laatste5;
        this.actieveSpeler.stand.serie = 0;
        if (this.isTeamWedstrijd()) {
            this.actieveTeam.stand.aantCar += this.actieveTeam.stand.serie;
            if (this.actieveTeam.stand.serie > this.actieveTeam.stand.hoogSer) {
                this.actieveTeam.stand.hoogSer = this.actieveTeam.stand.serie;
            }
            this.actieveTeam.stand.score.push(this.actieveTeam.stand.serie);
            let laatste5 = this.actieveTeam.stand.laatste5brt.slice();
            if (laatste5.length == 5) {
                laatste5.shift();
            }
            laatste5.push(this.actieveTeam.stand.serie);
            this.actieveTeam.stand.laatste5brt = laatste5;
            this.actieveTeam.stand.serie = 0;
        }
        if (this.wedstrijd.telling.idxOptie == 0) {
            this.oldPunten[this.idxSpeler] = this.actieveSpeler.stand.punten;
        }
    }

    followUpEnter() {
        // check for einde wedstrijd
        if (this.isWedstrijdOver()) {
            if (this.isTeamWedstrijd()) {
                this.wedstrijd.teams.forEach((tm, idx) => {
                    tm.stand.punten = this.getTeamPunten(tm, idx);
                });
            }
            else {
                this.wedstrijd.spelers.forEach((spl, idx) => {
                    spl.stand.punten = this.getPunten(spl, idx);
                });
            }
            this.wedstrijd.wedGespeeld = true;
            if (this.isTeamWedstrijd()) {
                this.wedstrijd.teams.forEach(team => {
                    team.actief = false;
                    team.spelers.forEach(spl => spl.actief = false);
                });
            }
            else {
                this.wedstrijd.spelers.forEach(spl => spl.actief = false);
            }
            this.idxTeam = -1;
            this.idxSpeler = -1;
            setTimeout(() => {
                const modalMsg = new ModalMessage('klaar', ['Einde wedstrijd'], 'Einde wedstrijd', 2.5);
                this.modals.push(modalMsg);
                this.showModal();
            }, 1000);
            this.opslaan.emit(this.wedstrijd);
            return;
        }
        // switch actieve speler
        if (this.isTeamWedstrijd()) {
            this.actieveTeam.actief = false;
            this.actieveSpeler.actief = false;
            if (this.idxTeam == 0) {
                this.idxTeam = 1;
            }
            else {
                this.idxTeam = 0;
                this.idxSpeler = this.idxSpeler == 0 ? 1 : 0;
            }
            this.actieveTeam = this.wedstrijd.teams[this.idxTeam];
            this.actieveSpeler = this.wedstrijd.teams[this.idxTeam].spelers[this.idxSpeler];
            this.actieveTeam.actief = true;
            this.actieveSpeler.actief = true;
        }
        else {
            const wasWit = this.actieveSpeler.metWit;
            this.actieveSpeler.actief = false;
            this.idxSpeler++;
            if (this.idxSpeler >= this.wedstrijd.aantSpelers) {
                this.idxSpeler = 0;
            }
            this.actieveSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.actieveSpeler.actief = true;
            if (this.wedstrijd.aantSpelers == 1 || this.wedstrijd.aantSpelers == 3) {
                this.actieveSpeler.metWit = !wasWit;
            }
        }
        const copyOfWedstrijd: Wedstrijd = JSON.parse(JSON.stringify(this.wedstrijd));
        if (this.isTeamWedstrijd()) {
            this.verhoogBeurtenEnBerekenData(this.actieveSpeler, this.actieveTeam);
        }
        else {
            this.verhoogBeurtenEnBerekenData(this.actieveSpeler);
        }
        if (this.wedstrijd.telling.idxOptie == 0) {
            this.oldPunten[this.idxSpeler] = this.actieveSpeler.stand.punten;
        }
        setTimeout(() => {
            this.checkForEnterMessages();
        }, 500);
        this.opslaan.emit(copyOfWedstrijd);
    }

    wijzigNamenPressed() {
        this.naamClicked(this.actieveSpeler);
    }

    naamClicked(spl: WedSpeler) {
        this.namenDialog.selSpelerId = spl.splId;
        this.namenDialog.spelers = this.getWedSpelers();
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

    private findSpelerById(id: string): WedSpeler | undefined {
        if (this.wedstrijd.teams.length) {
            let result: WedSpeler | undefined = undefined;
            this.wedstrijd.teams.some(tm => {
                result = tm.spelers.find(spl => spl.splId == id);
                return result ? true : false;
            });
            return result;
        }
        else {
            return this.wedstrijd.spelers.find(spl => spl.splId == id);
        }
    }

    private gotoConfig() {
        this.appData.gotoPage(this.appData.router.url, '/config');
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
            if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
                return false;
            }
            this.alert.hideHelp();
            return false;
        }        
        if (event.key === 'Escape') {
            if (this.actieveSpeler.stand.serie > 0) {
                this.addNumberToSerie('-1');
                return false;
            }
            this.keyPressed.emit('Escape');
            return false;
        }
        if (event.code === 'KeyI') {
            this.gotoConfig();
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
        if (event.code === 'KeyH') {
            this.alert.showHelp();
            return false;
        }
        if (event.code === 'KeyL') {
            this.keyPressed.emit('Lijst');
            return false;
        }
        if (this.toetsen.beurtMin.indexOf(event.code) >= 0) {
            this.undoLaatsteBeurt();
            return false;
        }
        if (!this.wedstrijd.wedGespeeld) {
            if (this.toetsen.beurtPlus.indexOf(event.code) >= 0) {
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
            if (this.toetsen.seriePlus.indexOf(event.code) >= 0) {
                this.addNumberToSerie('1');
                return false;
            }
            if (this.toetsen.serieMin.indexOf(event.code) >= 0) {
                this.addNumberToSerie('-1');
                return false;
            }
            if (event.key === '0' || event.code === 'Numpad0') {
                this.resetInput();
                return false;
            }
        }
        return true;
    }

    ngOnInit(): void {
        const apparaten: Apparaat[] = this.appData.getConfig()?.apparaten || [];
        const toetsenOk = this.setActieToetsen(apparaten);
        if (!toetsenOk) {
            this.alert.showAlert('Apparaten configuratie niet gevonden. Default toetsen worden gebruikt.', 'warning', 5);
            this.setDefaultActieToetsen();
        }
        this.repeatRemaining = this.appData.getConfig()?.repeatRemaining || false;
        this.sayGenoteerd = this.appData.getConfig()?.sayGenoteerd || false;
        if (this.wedstrijd.wedGespeeld) {
            if (this.wedstrijd.telling.idxOptie == 0) {
                if (this.isTeamWedstrijd()) {
                    this.oldPunten[0] = this.wedstrijd.teams[0].stand.punten;
                    this.oldPunten[1] = this.wedstrijd.teams[1].stand.punten;
                }
                else {
                    this.wedstrijd.spelers.forEach((spl, idx) => {
                        this.oldPunten[idx] = spl.stand.punten;
                    });
                }
            }
            // this.wedstrijd.message = new Message('success', 'EINDE WEDSTRIJD');
            // this.wedstrijd.message.show();
            setTimeout(() => {
                const modalMsg = new ModalMessage('klaar', ['Einde wedstrijd'], '', 2);
                this.modals.push(modalMsg);
                this.showModal();
            }, 2000);
            return;
        }
        this.setMaxBeurten();
        this.setActiveTeamEnSpeler();
        if (this.isTeamWedstrijd()) {
            this.verhoogBeurtenEnBerekenData(this.actieveSpeler, this.actieveTeam);
        }
        else {
            this.verhoogBeurtenEnBerekenData(this.actieveSpeler);
        }
        if (this.wedstrijd.telling.idxOptie == 0) {
            if (this.isTeamWedstrijd()) {
                this.oldPunten[0] = this.wedstrijd.teams[0].stand.punten;
                this.oldPunten[1] = this.wedstrijd.teams[1].stand.punten;
            }
            else {
                this.wedstrijd.spelers.forEach((spl, idx) => {
                    this.oldPunten[idx] = spl.stand.punten;
                });
            }
        }
        this.checkForEnterMessages();
    }

    private addNumberToSerie(numString: string) {
        if (this.keysLocked && !this.testMode) {
            return;
        }
        const nr = Number(numString);
        if (nr < 0 && this.actieveSpeler.stand.serie === 0) {
            return;
        }
        if (this.wedstrijd.regels.idxOptie != 1) {
            if (this.isTeamWedstrijd()) {
                if ((nr + this.actieveTeam.stand.serie + this.actieveTeam.stand.aantCar) > this.actieveTeam.teamTsCar) {
                    return;
                }        
            }
            else {
                if ((nr + this.actieveSpeler.stand.serie + this.actieveSpeler.stand.aantCar) > this.actieveSpeler.splTsCar) {
                    return;
                }        
            }
        }
        if (!this.keysLocked) {
            if (nr > 0) {
                this.keysLocked = true;
                setTimeout(() => {
                    this.keysLocked = false;
                }, 3000);
            }
        }
        this.actieveSpeler.stand.serie += nr;
        if (this.isTeamWedstrijd()) {
            this.actieveTeam.stand.serie += nr;
        }
        if (this.wedstrijd.regels.idxOptie != 1) {
            this.actieveSpeler.stand.voortgang = Math.floor(100 * (this.actieveSpeler.stand.aantCar + this.actieveSpeler.stand.serie) / this.actieveSpeler.splTsCar);
            if (this.isTeamWedstrijd()) {
                this.actieveSpeler.stand.voortgang = Math.floor(100 * (this.actieveSpeler.stand.aantCar + this.actieveSpeler.stand.serie) / this.actieveTeam.teamTsCar);
                this.actieveTeam.stand.voortgang = Math.floor(100 * (this.actieveTeam.stand.aantCar + this.actieveTeam.stand.serie) / this.actieveTeam.teamTsCar);
            }
        }
        this.aantBereikt = this.checkForSerieMessages();
        setTimeout(() => {
            this.setGemiddeldes(this.actieveSpeler);
            if (this.isTeamWedstrijd()) {
                this.setTeamGemiddeldes(this.actieveTeam);
                if (this.wedstrijd.telling.idxOptie == 0) {
                    this.actieveTeam.stand.punten = this.getTeamPunten(this.actieveTeam);
                }
            }
            else {
                if (this.wedstrijd.telling.idxOptie == 0) {
                    this.actieveSpeler.stand.punten = this.getPunten(this.actieveSpeler);
                }
            }
            if (this.aantBereikt) {
                this.aantBereikt = false;
                this.keysLocked = false;
                this.enterPressed();
            }
        }, 2000);
    }

    private checkForSerieMessages(): boolean {
        if (this.isTeamWedstrijd()) {
            return this.checkForTeamSerieMessages();
        }
        let msgs: string[] = [];
        let spk = '';
        let msgType = 'serie';
        if (this.actieveSpeler.stand.serie == 0) {
            return false;
        }
        let remainingCar = 100;
        if (this.wedstrijd.regels.idxOptie != 1) {  // geen vast aantal beurten
            remainingCar = this.actieveSpeler.splTsCar - this.actieveSpeler.stand.aantCar - this.actieveSpeler.stand.serie;
        }
        if (remainingCar === 0) {
            this.actieveSpeler.stand.enNog = -1;
            return true;
        }
        if (remainingCar < 4) {
            this.actieveSpeler.stand.enNog = remainingCar;
            msgs.push(`${this.actieveSpeler.stand.serie}`);
            msgs.push(`en nog ${remainingCar}`);
            spk = `${this.actieveSpeler.stand.serie}, en nog ${remainingCar}.`;
        }
        else {
            this.actieveSpeler.stand.enNog = -1;
            msgs.push(`${this.actieveSpeler.stand.serie}`);
            msgs.push('');
            spk = `${this.actieveSpeler.stand.serie}`;
        }
        if (this.actieveSpeler.stand.serie > 0) {
            if (msgs.length > 0) {
                const modalMsg = new ModalMessage(msgType, msgs, spk, 3);
                this.modals.push(modalMsg);
                this.showModal();
                return false;
            }
            if (spk.length) {
                this.textsToSpeak.push(spk);
                this.speakTexts();
            }
        }
        return false;
    }

    private checkForTeamSerieMessages(): boolean {
        let msgs: string[] = [];
        let spk = '';
        let msgType = 'serie';
        if (this.actieveTeam.stand.serie == 0) {
            return false;
        }
        let remainingCar = 100;
        if (this.wedstrijd.regels.idxOptie != 1) {  // geen vast aantal beurten
            remainingCar = this.actieveTeam.teamTsCar - this.actieveTeam.stand.aantCar - this.actieveTeam.stand.serie;
        }
        if (remainingCar === 0) {
            this.actieveTeam.stand.enNog = -1;
            return true;
        }
        if (remainingCar < 4) {
            this.actieveTeam.stand.enNog = remainingCar;
            msgs.push(`${this.actieveTeam.stand.serie}`);
            msgs.push(`en nog ${remainingCar}`);
            spk = `${this.actieveTeam.stand.serie}, en nog ${remainingCar}.`;
        }
        else {
            this.actieveTeam.stand.enNog = -1;
            msgs.push(`${this.actieveTeam.stand.serie}`);
            msgs.push('');
            spk = `${this.actieveTeam.stand.serie}`;
        }
        if (this.actieveTeam.stand.serie > 0) {
            if (msgs.length > 0) {
                const modalMsg = new ModalMessage(msgType, msgs, spk, 3);
                this.modals.push(modalMsg);
                this.showModal();
                return false;
            }
            if (spk.length) {
                this.textsToSpeak.push(spk);
                this.speakTexts();
            }
        }
        return false;
    }

    private checkForEnterMessages() {
        if (this.isTeamWedstrijd()) {
            this.checkForTeamEnterMessages();
            return;
        }
        let msgs: string[] = [];
        let spk = '';
        let msgType = 'beurt';
        // gelijkmakende beurt
        if (this.idxSpeler > 0 && this.wedstrijd.regels.idxOptie != 1) {
            let idx = this.findIndexEersteSpelerDieCarsHeeftBereikt();
            if (idx >= 0 && this.idxSpeler > idx) {
                msgs = ['Laatste', 'beurt'];
                spk = 'Laatste beurt';
            }
        }
        // (voor)laatste beurt
        if (!spk.length) { // dus niet gelijkmakende beurt
            const remainingBrt = this.wedstrijd.regels.maxBeurten - this.actieveSpeler.stand.aantBrt;
            if (remainingBrt === 1) {
                msgs = ['Voorlaatste', 'beurt'];
                spk = 'Voorlaatste beurt';
            }
            if (remainingBrt === 0) {
                msgs = ['Laatste', 'beurt'];
                spk = 'Laatste beurt';
            }
        }
        // herhaal 'en nog ...' melding
        if (this.wedstrijd.regels.idxOptie != 1) {
            const remainingCar = this.actieveSpeler.splTsCar - this.actieveSpeler.stand.aantCar - this.actieveSpeler.stand.serie;
            if (remainingCar > 0 && remainingCar < 4) {
                this.actieveSpeler.stand.enNog = remainingCar;
                if (this.repeatRemaining ) {
                    msgs.push(this.actieveSpeler.splBordNaam);
                    msgs.push(`nog ${remainingCar}`);
                    msgType = 'remaining';
                    if (spk.length) {
                        spk = spk + `. ${this.actieveSpeler.splBordNaam}, nog ${remainingCar}.`;    
                    }
                    else {
                        spk = `${this.actieveSpeler.splSpreekNaam}. Nog ${remainingCar}.`;    
                    }
                }
            }
            else {
                this.actieveSpeler.stand.enNog = -1;
            }
        }
        if (msgs.length > 0) {
            const modalMsg = new ModalMessage(msgType, msgs, spk, 4);
            this.modals.push(modalMsg);
            this.showModal();
            return;
        }
        if (spk.length) {
            this.textsToSpeak.push(spk);
            this.speakTexts();
        }
    }

    private checkForTeamEnterMessages() {
        let msgs: string[] = [];
        let spk = '';
        let msgType = 'beurt';
        // gelijkmakende beurt
        if (this.wedstrijd.regels.idxOptie != 1) {
            if (this.idxTeam == 1 && this.wedstrijd.teams[0].stand.aantCar == this.wedstrijd.teams[0].teamTsCar) {
                msgs = ['Laatste', 'beurt'];
                spk = 'Laatste beurt';
            }
        }
        // (voor)laatste beurt
        if (!spk.length) { // dus niet gelijkmakende beurt
            const remainingBrt = this.wedstrijd.regels.maxBeurten - this.actieveSpeler.stand.aantBrt;
            if (remainingBrt === 1) {
                msgs = ['Voorlaatste', 'beurt'];
                spk = 'Voorlaatste beurt';
            }
            if (remainingBrt === 0) {
                msgs = ['Laatste', 'beurt'];
                spk = 'Laatste beurt';
            }
        }
        // herhaal 'en nog ...' melding
        if (this.wedstrijd.regels.idxOptie != 1) {
            const remainingCar = this.actieveTeam.teamTsCar - this.actieveTeam.stand.aantCar - this.actieveTeam.stand.serie;
            if (remainingCar > 0 && remainingCar < 4) {
                this.actieveTeam.stand.enNog = remainingCar;
                if (this.repeatRemaining) {
                    if (remainingCar > 0 && remainingCar < 4) {
                        msgs.push(this.actieveTeam.teamNaam);
                        msgs.push(`nog ${remainingCar}`);
                        msgType = 'remaining';
                        if (spk.length) {
                            spk = spk + `. ${this.actieveTeam.teamNaam}, nog ${remainingCar}.`;    
                        }
                        else {
                            spk = `${this.actieveTeam.teamNaam}. Nog ${remainingCar}.`;    
                        }
                    }
                }
            }
            else {
                this.actieveTeam.stand.enNog = -1;
            }
        }
        if (msgs.length > 0) {
            const modalMsg = new ModalMessage(msgType, msgs, spk, 4);
            this.modals.push(modalMsg);
            this.showModal();
            return;
        }
        if (spk.length) {
            this.textsToSpeak.push(spk);
            this.speakTexts();
        }
    }

    private verhoogBeurtenEnBerekenData(spl: WedSpeler, team?: WedTeam): void {
        spl.stand.aantBrt++;
        if (team) {
            team.stand.aantBrt++;
        }
        if (this.wedstrijd.regels.idxOptie == 1) {
            spl.stand.voortgang = Math.floor(100 * spl.stand.aantBrt / this.wedstrijd.regels.maxBeurten);
            if (team) {
                team.stand.voortgang = Math.floor(50 * team.stand.aantBrt / this.wedstrijd.regels.maxBeurten);
            }
        }
        setTimeout(() => {
            this.setGemiddeldes(spl);
            if (team) {
                this.setTeamGemiddeldes(team);
                if (this.wedstrijd.telling.idxOptie == 0) {
                    team.stand.punten = this.getTeamPunten(team);
                }
            }
            else {
                if (this.wedstrijd.telling.idxOptie == 0) {
                    spl.stand.punten = this.getPunten(spl);
                }
            }
        }, 2000);
    }

    private verminderBeurtenEnBerekenData(spl: WedSpeler, team?: WedTeam): void {
        spl.stand.aantBrt--;
        if (this.wedstrijd.regels.idxOptie == 1) {
            spl.stand.voortgang = Math.floor(100 * spl.stand.aantBrt / this.wedstrijd.regels.maxBeurten);
        }
        spl.stand.serie = 0;
        this.setGemiddeldes(spl);
        if (team) {
            team.stand.aantBrt--;
            if (this.wedstrijd.regels.idxOptie == 1) {
                team.stand.voortgang = Math.floor(50 * team.stand.aantBrt / this.wedstrijd.regels.maxBeurten);
            }
            team.stand.serie = 0;
            this.setTeamGemiddeldes(team);
            if (this.wedstrijd.telling.idxOptie == 0) {
                team.stand.punten = this.getTeamPunten(team);
            }
        }
        else {
            if (this.wedstrijd.telling.idxOptie == 0) {
                spl.stand.punten = this.getPunten(spl);
            }
        }
    }

    private undoLaatsteBeurt(): boolean {
        if (this.isTeamWedstrijd()) {
            if (this.wedstrijd.teams[0].spelers[0].actief && this.wedstrijd.teams[0].spelers[0].stand.aantBrt === 1) {
                return false;
            }    
        }
        else {
            if (this.wedstrijd.spelers[0].actief && this.wedstrijd.spelers[0].stand.aantBrt === 1) {
                return false;
            }    
        }
        const wasWedOver = this.wedstrijd.wedGespeeld;
        if (this.wedstrijd.wedGespeeld) {
            this.wedstrijd.wedGespeeld = false;
            // alle spelers zijn actief dus allen inactiveren behalve de laatse; die blijft actief
            if (this.isTeamWedstrijd()) {
                this.wedstrijd.teams.forEach(team => {
                    team.actief = false;
                    team.spelers.forEach(spl => {
                        spl.actief = false;
                    });
                });
                this.idxTeam = 1;
                this.actieveTeam = this.wedstrijd.teams[1];
                this.actieveTeam.actief = true;
                this.idxSpeler = this.actieveTeam.spelers[0].stand.aantBrt === this.actieveTeam.spelers[1].stand.aantBrt ? 1 : 0;
                this.actieveSpeler = this.actieveTeam.spelers[this.idxSpeler];
                this.actieveSpeler.actief = true;
            }
            else {
                this.wedstrijd.spelers.forEach(spl => {
                    spl.actief = false;
                });
                this.idxSpeler = this.wedstrijd.aantSpelers - 1;
                this.actieveSpeler = this.wedstrijd.spelers[this.idxSpeler];
                this.actieveSpeler.actief = true;
            }
        }
        else {
            // werk beurten en stand huidige speler bij
            this.actieveSpeler.stand.aantBrt--;
            if (this.wedstrijd.regels.idxOptie == 1) {
                this.actieveSpeler.stand.voortgang = Math.floor(100 * this.actieveSpeler.stand.aantBrt / this.wedstrijd.regels.maxBeurten);
            }
            this.actieveSpeler.stand.serie = 0;
            this.setGemiddeldes(this.actieveSpeler);
            if (this.isTeamWedstrijd()) {
                this.actieveTeam.stand.aantBrt--;
                if (this.wedstrijd.regels.idxOptie == 1) {
                    this.actieveTeam.stand.voortgang = Math.floor(50 * this.actieveTeam.stand.aantBrt / this.wedstrijd.regels.maxBeurten);
                }
                this.actieveTeam.stand.serie = 0;
                this.setTeamGemiddeldes(this.actieveTeam);
                if (this.wedstrijd.telling.idxOptie == 0) {
                    this.actieveTeam.stand.punten = this.getTeamPunten(this.actieveTeam);
                    this.oldPunten[this.idxTeam] = this.actieveTeam.stand.punten;
                }
            }
            else {
                if (this.wedstrijd.telling.idxOptie == 0) {
                    this.actieveSpeler.stand.punten = this.getPunten(this.actieveSpeler);
                    this.oldPunten[this.idxSpeler] = this.actieveSpeler.stand.punten;
                }
            }
            // maak vorige speler de huidige speler
            if (this.isTeamWedstrijd()) {
                this.actieveTeam.actief = false;
                this.actieveSpeler.actief = false;
                this.idxTeam = this.idxTeam === 1 ? 0 : 1;
                this.actieveTeam = this.wedstrijd.teams[this.idxTeam];
                this.actieveTeam.actief = true;
                if (this.idxTeam === 1) {
                    this.idxSpeler = this.idxSpeler === 1 ? 0 : 1;
                }
                this.actieveSpeler = this.actieveTeam.spelers[this.idxSpeler];
                this.actieveSpeler.actief = true;        
            }
            else {
                let wasMetWit = this.actieveSpeler.metWit;
                this.actieveSpeler.actief = false;
                this.idxSpeler--;
                if (this.idxSpeler < 0) {
                    this.idxSpeler = this.wedstrijd.aantSpelers - 1;
                }
                this.actieveSpeler = this.wedstrijd.spelers[this.idxSpeler];
                this.actieveSpeler.actief = true;    
                if (this.wedstrijd.aantSpelers == 3) {
                    this.actieveSpeler.metWit = !wasMetWit;
                }
            }
        }
        let laatsteSerie = this.actieveSpeler.stand.score.pop();
        if (!laatsteSerie) {
            laatsteSerie = 0;
        }
        if (this.isTeamWedstrijd()) {
            this.actieveTeam.stand.score.pop();
        }
        this.actieveSpeler.stand.serie = laatsteSerie;
        this.actieveSpeler.stand.aantCar -= laatsteSerie;
        if (this.isTeamWedstrijd()) {
            this.actieveTeam.stand.serie = laatsteSerie;
            this.actieveTeam.stand.aantCar -= laatsteSerie;
        }
        if (this.wedstrijd.telling.idxOptie == 0) {
            this.oldPunten[this.idxSpeler] = this.getOldPunten(this.actieveSpeler);
        }
        // indien het gameover was werk punten bij van alle spelers
        if (wasWedOver && this.wedstrijd.telling.idxOptie == 0) {
            if (this.isTeamWedstrijd()) {
                this.wedstrijd.teams.forEach(tm => {
                    tm.stand.punten = this.getTeamPunten(tm);
                });
            }
            else {
                this.wedstrijd.spelers.forEach(spl => {
                    spl.stand.punten = this.getPunten(spl);
                });
            }
        }
        // werk hoogste serie bij
        if (laatsteSerie === this.actieveSpeler.stand.hoogSer && laatsteSerie > 0) {
            let hoogste = 0;
            this.actieveSpeler.stand.score.forEach(nr => {
                if (nr > hoogste) {
                    hoogste = nr;
                }
            });
            this.actieveSpeler.stand.hoogSer = hoogste;
        }
        if (this.isTeamWedstrijd()) {
            if (laatsteSerie === this.actieveTeam.stand.hoogSer && laatsteSerie > 0) {
                let hoogste = 0;
                this.actieveTeam.stand.score.forEach(nr => {
                    if (nr > hoogste) {
                        hoogste = nr;
                    }
                });
                this.actieveTeam.stand.hoogSer = hoogste;
            }
        }
        // werk laatste 5 beurten bij
        let laatste5: number[] = [];
        let aant = 0;
        for (let i = this.actieveSpeler.stand.score.length - 1; i >= 0; i--) {
            laatste5.unshift(this.actieveSpeler.stand.score[i]);
            aant++;
            if (aant == 5) {
                break;
            }
        }
        this.actieveSpeler.stand.laatste5brt = laatste5;
        if (this.isTeamWedstrijd()) {
            laatste5 = [];
            aant = 0;
            for (let i = this.actieveTeam.stand.score.length - 1; i >= 0; i--) {
                laatste5.unshift(this.actieveTeam.stand.score[i]);
                aant++;
                if (aant == 5) {
                    break;
                }
            }
            this.actieveTeam.stand.laatste5brt = laatste5;    
        }
        const copyOfWedstrijd: Wedstrijd = JSON.parse(JSON.stringify(this.wedstrijd));
        if (this.isTeamWedstrijd()) {
            let actTeam = copyOfWedstrijd.teams[this.idxTeam];
            let actSpl = actTeam.spelers[this.idxSpeler];
            this.verminderBeurtenEnBerekenData(actSpl, actTeam);
        }
        else {
            let actSpl = copyOfWedstrijd.spelers[this.idxSpeler];
            this.verminderBeurtenEnBerekenData(actSpl);    
        }
        this.checkForEnterMessages();
        this.opslaan.emit(copyOfWedstrijd);
        return false;
    }

    private resetInput(): boolean {
        this.addNumberToSerie('-' + this.actieveSpeler.stand.serie);
        if (this.isTeamWedstrijd()) {
            this.addNumberToSerie('-' + this.actieveTeam.stand.serie);
        }
        return false;
    }

    private setGemiddeldes(spl: WedSpeler): void {
        if (spl.stand.aantBrt === 0) {
            spl.stand.gemiddelde = 0;
        }
        else {
            spl.stand.gemiddelde = (spl.stand.aantCar + spl.stand.serie) / spl.stand.aantBrt;
        }
        spl.stand.moyView = this.helper.formatNumber(spl.stand.gemiddelde, '1.3-3');
        const perc = 100 * spl.stand.gemiddelde / spl.splTsMoy;
        spl.stand.percView = this.helper.formatNumber(perc, '1.2-2');
    }

    private setTeamGemiddeldes(team: WedTeam): void {
        if (team.stand.aantBrt === 0) {
            team.stand.gemiddelde = 0;
        }
        else {
            team.stand.gemiddelde = (team.stand.aantCar + team.stand.serie) / team.stand.aantBrt;
        }
        team.stand.moyView = this.helper.formatNumber(team.stand.gemiddelde, '1.3-3');
        const perc = 100 * team.stand.gemiddelde / team.teamTsMoy;
        team.stand.percView = this.helper.formatNumber(perc, '1.2-2');
    }

    private getHoogsteSerie(spl: WedSpeler | WedTeam): number {
        let result = 0;
        spl.stand.score.forEach(cars => {
            if (cars > result) {
                result = cars;
            }
        });
        return result;
    }

    private getPunten(spl: WedSpeler, idx?: number): number {
        let punten = 0;
        if (this.wedstrijd.telling.idxOptie == 0) {
            punten = Math.floor(10 * (spl.stand.aantCar + spl.stand.serie) / spl.splTsCar);
        }
        else {
            if (this.wedstrijd.aantSpelers != 2) {
                return 0;
            }
            if (idx != undefined && idx != null) {
                let teg = this.wedstrijd.spelers[Math.abs(idx - 1)];
                if (this.wedstrijd.regels.idxOptie == 1) {
                    if ((spl.stand.gemiddelde / spl.splTsMoy) > (teg.stand.gemiddelde / teg.splTsMoy)) {
                        punten = this.wedstrijd.telling.winstPunten;
                    }
                    else if ((spl.stand.gemiddelde / spl.splTsMoy) == (teg.stand.gemiddelde / teg.splTsMoy)) {
                        punten = this.wedstrijd.telling.gelijkPunten;
                    }
                    else {
                        punten = 0;
                    }
                }
                else {
                    if (spl.stand.aantCar == spl.splTsCar || teg.stand.aantCar == teg.splTsCar) {
                        if (spl.stand.aantCar == spl.splTsCar && teg.stand.aantCar == teg.splTsCar) {
                            punten = this.wedstrijd.telling.gelijkPunten;
                        }
                        else {
                            punten = (spl.stand.aantCar == spl.splTsCar) ? this.wedstrijd.telling.winstPunten : 0
                        }
                    }
                    else {
                        if ((spl.stand.aantCar / spl.splTsCar) > (teg.stand.aantCar / teg.splTsCar)) {
                            punten = this.wedstrijd.telling.winstPunten;
                        }
                        else if ((spl.stand.aantCar / spl.splTsCar) == (teg.stand.aantCar / teg.splTsCar)) {
                            punten = this.wedstrijd.telling.gelijkPunten;
                        }
                        else {
                            punten = 0;
                        }    
                    }
                }
            }
        }
        if (spl.stand.gemiddelde > spl.splTsMoy) {
            punten += this.wedstrijd.telling.bovenMoyPunten;
        }
        return punten;
    }

    private getTeamPunten(team: WedTeam, idx?: number): number {
        let punten = 0;
        if (this.wedstrijd.telling.idxOptie == 0) {
            punten = Math.floor(10 * (team.stand.aantCar + team.stand.serie) / team.teamTsCar);
        }
        else {
            if (idx != undefined && idx != null) {
                let teg = this.wedstrijd.teams[Math.abs(idx - 1)];
                if (this.wedstrijd.regels.idxOptie == 1) {
                    if ((team.stand.gemiddelde / team.teamTsMoy) > (teg.stand.gemiddelde / teg.teamTsMoy)) {
                        punten = this.wedstrijd.telling.winstPunten;
                    }
                    else if ((team.stand.gemiddelde / team.teamTsMoy) == (teg.stand.gemiddelde / teg.teamTsMoy)) {
                        punten = this.wedstrijd.telling.gelijkPunten;
                    }
                    else {
                        punten = 0;
                    }
                }
                else {
                    if (team.stand.aantCar == team.teamTsCar || teg.stand.aantCar == teg.teamTsCar) {
                        if (team.stand.aantCar == team.teamTsCar && teg.stand.aantCar == teg.teamTsCar) {
                            punten = this.wedstrijd.telling.gelijkPunten;
                        }
                        else {
                            punten = (team.stand.aantCar == team.teamTsCar) ? this.wedstrijd.telling.winstPunten : 0
                        }
                    }
                    else {
                        if ((team.stand.aantCar / team.teamTsCar) > (teg.stand.aantCar / teg.teamTsCar)) {
                            punten = this.wedstrijd.telling.winstPunten;
                        }
                        else if ((team.stand.aantCar / team.teamTsCar) == (teg.stand.aantCar / teg.teamTsCar)) {
                            punten = this.wedstrijd.telling.gelijkPunten;
                        }
                        else {
                            punten = 0;
                        }    
                    }
                }
            }
        }
        if (team.stand.gemiddelde > team.teamTsMoy) {
            punten += this.wedstrijd.telling.bovenMoyPunten;
        }
        return punten;
    }

    private getOldPunten(spl: WedSpeler): number {
        let gem = (spl.stand.aantBrt === 0) ? 0 : spl.stand.aantCar / spl.stand.aantBrt;
        let punten = Math.floor(10 * spl.stand.aantCar / spl.splTsCar);
        if (gem > spl.splTsMoy) {
            punten += this.wedstrijd.telling.bovenMoyPunten;
        }
        return punten;
    }

    private setActiveTeamEnSpeler() {
        if (this.isTeamWedstrijd()) {
            this.idxTeam = this.wedstrijd.teams.findIndex(team => team.actief);
            this.idxTeam = (this.idxTeam < 0) ? 0 : this.idxTeam;
            this.idxSpeler = this.wedstrijd.teams[this.idxTeam].spelers.findIndex(spl => spl.actief);
            this.idxSpeler = (this.idxSpeler < 0) ? 0 : this.idxSpeler;
            this.actieveTeam = this.wedstrijd.teams[this.idxTeam];
            this.actieveTeam.actief = true;
            this.actieveSpeler = this.actieveTeam.spelers[this.idxSpeler];
            this.actieveSpeler.actief = true;
        }
        else {
            this.idxSpeler = this.wedstrijd.spelers.findIndex(spl => spl.actief);
            this.idxSpeler = (this.idxSpeler < 0) ? 0 : this.idxSpeler;
            this.actieveSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.actieveSpeler.actief = true;    
        }
    }

    private isWedstrijdOver(): boolean {
        if (this.isTeamWedstrijd()) {
            if (this.idxTeam === 0) {
                return false;
            }
            // het actieve team is nu dus het laatste team
            if (this.actieveTeam.stand.aantBrt === 999) {
                return true;
            }
            if (this.idxTeam === 1 && this.idxSpeler === 1 && this.actieveSpeler.stand.aantBrt === this.wedstrijd.regels.maxBeurten) {
                return true;
            }
            if (this.wedstrijd.regels.idxOptie != 1) {
                if (this.eenVanDeTeamsHeeftCarsBereikt()) {
                    return true;
                }
            }
        }
        else {
            if (this.idxSpeler < this.wedstrijd.aantSpelers - 1) {
                return false;
            }
            // de actieve speler is nu dus de laatste speler
            if (this.actieveSpeler.stand.aantBrt === 999) {
                return true;
            }
            if (this.actieveSpeler.stand.aantBrt === this.wedstrijd.regels.maxBeurten) {
                return true;
            }
            if (this.wedstrijd.regels.idxOptie != 1) {
                if (this.eenVanDeSpelersHeeftCarsBereikt()) {
                    return true;
                }
            }
        }
        return false;
    }

    private eenVanDeTeamsHeeftCarsBereikt(): boolean {
        return this.wedstrijd.teams.some(team => team.stand.aantCar === team.teamTsCar);
    }

    private eenVanDeSpelersHeeftCarsBereikt(): boolean {
        return this.wedstrijd.spelers.some(spl => spl.stand.aantCar === spl.splTsCar);
    }

    private findIndexEersteSpelerDieCarsHeeftBereikt(): number {
        return this.wedstrijd.spelers.findIndex(spl => spl.stand.aantCar === spl.splTsCar);
    }

    private isTeamWedstrijd(): boolean {
        return this.wedstrijd.aantSpelers == 5;
    }

    private setMaxBeurten() {
        if (this.wedstrijd.regels.idxOptie == 1) {
            this.wedstrijd.regels.maxBeurten = this.wedstrijd.regels.vastAantBrt;
        }
        else {
            if (this.wedstrijd.regels.maxBeurten == 0) {
                this.wedstrijd.regels.maxBeurten = 100;
            }
        }
    }

    private getWedSpelers(): SpelerNamen[] {
        let result: SpelerNamen[] = [];
        if (this.wedstrijd.teams.length) {
            this.wedstrijd.teams.forEach(tm => {
                tm.spelers.forEach(spl => {
                    result.push(new SpelerNamen(spl));
                });
            });
        }
        else {
            this.wedstrijd.spelers.forEach(spl => {
                result.push(new SpelerNamen(spl));
            });
        }
        return result;
    }

    private setActieToetsen(apparaten: Apparaat[]): boolean {
        if (!apparaten.length) {
            return false;
        }
        let obj: any = {
            beurtPlus: [],
            beurtMin: [],
            seriePlus: [],
            serieMin: []
        };
        apparaten.forEach(apparaat => {
            const spel = apparaat.spelen.find(sp => sp.id == '3BA');
            if (spel) {
                spel.acties.forEach(actie => {
                    obj[actie.id].push(actie.code);
                });
            }
        });
        if (!(obj.beurtPlus.length && obj.beurtMin.length && obj.seriePlus.length && obj.serieMin.length)) {
            return false;
        }
        Object.assign(this.toetsen, obj);
        console.log(this.toetsen);
        return true;
    }

    private setDefaultActieToetsen() {
        this.toetsen.beurtPlus = ['Enter', 'NumpadEnter', 'PageDown'];
        this.toetsen.beurtMin = ['Period', 'NumpadDecimal'];
        this.toetsen.seriePlus = ['Space', 'NumpadAdd', 'PageUp'];
        this.toetsen.serieMin = ['Minus', 'NumpadSubtract', 'F5'];
    }

    private showModal(): void {
        if (!this.modalVisible) {
            this.modalVisible = true;
            if (this.modals[0].textToSpeak.length) {
                this.spraak.speak(this.modals[0].textToSpeak);
            }
            setTimeout(() => {
                if (this.modals[0].type == 'noteer') {
                    setTimeout(() => {
                        this.followUpEnter();
                    }, 500);
                }
                this.hideModal();
            }, this.modals[0].duration);
        }
    }

    hideModal(): void {
        if (this.modalVisible) {
            this.modalVisible = false;
            setTimeout(() => {
                this.modals.shift();
                if (this.modals.length) {
                    this.showModal();
                }
                else if (this.wedstrijd.opslaanInComp && this.wedstrijd.wedGespeeld) {
                    this.idxSpeler = -1;
                    this.keyPressed.emit('Ready');
                }
            }, 1000);
        }
    }

    private speakTexts(): void {
        if (this.textsToSpeak.length) {
            this.spraak.speak(this.textsToSpeak[0]);
            this.textsToSpeak.shift();
            setTimeout(() => {
                this.speakTexts();
            }, 3000);
        }
    }

    private async delay(ms: number) {
        // Creates a promise that resolves after <ms> milliseconds
        await new Promise(resolve => setTimeout(resolve, ms));
    }

}
