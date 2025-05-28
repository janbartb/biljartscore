import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { WedSpeler, Wedstrijd, WedTeam } from '../../model/wedstrijd';
import { NgClass } from '@angular/common';
import { ScoreSpelerComponent } from './score-speler/score-speler.component';
import { SpelerNamen, SpelerNamenDialog } from '../../model/dialogs';
import { ModalMessage } from '../../model/modal-message';
import { SpeechService } from '../../services/speech.service';
import { AlertService } from '../../services/alert.service';
import { SpelersNamenComponent } from '../spelers-namen/spelers-namen.component';
import { ScoreSpelerLandscapeComponent } from './score-speler-landscape/score-speler-landscape.component';
import { ScoreTeamComponent } from './score-team/score-team.component';
import { HelpScoreComponent } from "../help-score/help-score.component";

@Component({
    selector: 'app-score',
    standalone: true,
    imports: [
    ScoreSpelerComponent,
    ScoreSpelerLandscapeComponent,
    ScoreTeamComponent,
    SpelersNamenComponent,
    HelpScoreComponent,
    NgClass,
    HelpScoreComponent
],
    templateUrl: './score.component.html',
    styleUrl: './score.component.css'
})
export class ScoreComponent implements OnInit {
    spraak = inject(SpeechService);
    alert = inject(AlertService);

    @Input() wedstrijd: Wedstrijd = new Wedstrijd();
    @Output() opslaan: EventEmitter<Wedstrijd> = new EventEmitter<Wedstrijd>();
    @Output() keyPressed: EventEmitter<string> = new EventEmitter<string>();

    activeTeam: WedTeam = new WedTeam();
    activeSpeler: WedSpeler = new WedSpeler();
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
    oldPunten: number[] = [0, 0];
    
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
        // werk score bij
        if (this.activeSpeler.stand.serie > 0) {
            const msgToSpeak = 'Genoteerd, ' + this.activeSpeler.splSpreekNaam + ', ' + this.activeSpeler.stand.serie;
            const modalMsg = new ModalMessage('serie', [this.activeSpeler.splBordNaam], msgToSpeak, 4, '' + this.activeSpeler.stand.serie);
            this.modals.push(modalMsg);
            this.showModal();
        }
        else {
            const msgToSpeak = 'Genoteerd, ' + this.activeSpeler.splSpreekNaam + ', ' + this.activeSpeler.stand.serie;
            const modalMsg = new ModalMessage('serie', [this.activeSpeler.splBordNaam], msgToSpeak, 4, '0');
            this.modals.push(modalMsg);
            this.showModal();
        }
    }

    followUpEnter() {
        this.activeSpeler.stand.aantCar += this.activeSpeler.stand.serie;
        if (this.activeSpeler.stand.serie > this.activeSpeler.stand.hoogSer) {
            this.activeSpeler.stand.hoogSer = this.activeSpeler.stand.serie;
        }
        this.activeSpeler.stand.score.push(this.activeSpeler.stand.serie);
        let laatste5 = this.activeSpeler.stand.laatste5brt.slice();
        if (laatste5.length == 5) {
            laatste5.shift();
        }
        laatste5.push(this.activeSpeler.stand.serie);
        this.activeSpeler.stand.laatste5brt = laatste5;
        this.activeSpeler.stand.serie = 0;
        if (this.isTeamWedstrijd()) {
            this.activeTeam.stand.aantCar += this.activeTeam.stand.serie;
            if (this.activeTeam.stand.serie > this.activeTeam.stand.hoogSer) {
                this.activeTeam.stand.hoogSer = this.activeTeam.stand.serie;
            }
            this.activeTeam.stand.score.push(this.activeTeam.stand.serie);
            let laatste5 = this.activeTeam.stand.laatste5brt.slice();
            if (laatste5.length == 5) {
                laatste5.shift();
            }
            laatste5.push(this.activeTeam.stand.serie);
            this.activeTeam.stand.laatste5brt = laatste5;
            this.activeTeam.stand.serie = 0;
        }
        if (this.wedstrijd.telling.idxOptie == 0) {
            this.oldPunten[this.idxSpeler] = this.activeSpeler.stand.punten;
        }
        // check for einde wedstrijd
        if (this.isWedstrijdOver()) {
            this.wedstrijd.spelers.forEach((spl, idx) => {
                spl.stand.punten = this.getPunten(spl, idx);
            });
            this.wedstrijd.wedGespeeld = true;
            if (this.isTeamWedstrijd()) {
                this.wedstrijd.teams.forEach(team => {
                    team.actief = true;
                    team.spelers.forEach(spl => spl.actief = true);
                });
            }
            else {
                this.wedstrijd.spelers.forEach(spl => spl.actief = true);
            }
            this.idxTeam = -1;
            this.idxSpeler = -1;
            const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], 'Einde wedstrijd', 3);
            this.modals.push(modalMsg);
            this.showModal();
            this.opslaan.emit(this.wedstrijd);
            return;
        }
        // switch actieve speler
        if (this.isTeamWedstrijd()) {
            this.activeTeam.actief = false;
            this.activeSpeler.actief = false;
            if (this.idxTeam == 0) {
                this.idxTeam = 1;
            }
            else {
                this.idxTeam = 0;
                this.idxSpeler = this.idxSpeler == 0 ? 1 : 0;
            }
            this.activeTeam = this.wedstrijd.teams[this.idxTeam];
            this.activeSpeler = this.wedstrijd.teams[this.idxTeam].spelers[this.idxSpeler];
            this.activeTeam.actief = true;
            this.activeSpeler.actief = true;
        }
        else {
            const wasWit = this.activeSpeler.metWit;
            this.activeSpeler.actief = false;
            this.idxSpeler++;
            if (this.idxSpeler >= this.wedstrijd.aantSpelers) {
                this.idxSpeler = 0;
            }
            this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.activeSpeler.actief = true;
            if (this.wedstrijd.aantSpelers == 1 || this.wedstrijd.aantSpelers == 3) {
                this.activeSpeler.metWit = !wasWit;
            }
        }
        const copyOfWedstrijd: Wedstrijd = JSON.parse(JSON.stringify(this.wedstrijd));
        if (this.isTeamWedstrijd()) {
            this.verhoogBeurtenEnBerekenData(this.activeSpeler, this.activeTeam);
        }
        else {
            this.verhoogBeurtenEnBerekenData(this.activeSpeler);
        }
        if (this.wedstrijd.telling.idxOptie == 0) {
            this.oldPunten[this.idxSpeler] = this.activeSpeler.stand.punten;
        }
        this.checkForMessages(false, true);
        this.opslaan.emit(copyOfWedstrijd);
    }

    wijzigNamenPressed() {
        this.naamClicked(this.activeSpeler);
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
        if (event.key === 'Escape' || event.key === 'Backspace' || event.code == 'F5') {
            if (this.activeSpeler.stand.serie > 0) {
                this.addNumberToSerie('-1');
            }
            else {
                this.keyPressed.emit('Escape');
            }
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
            this.keyPressed.emit('Lijst');
            return false;
        }
        if (event.key === 'Delete' || event.code === 'NumpadDecimal' || event.code == 'Period') {
            this.undoLaatsteBeurt();
            return false;
        }
        if (!this.wedstrijd.wedGespeeld) {
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
        return true;
    }

    ngOnInit(): void {
        if (this.wedstrijd.wedGespeeld) {
            if (this.wedstrijd.telling.idxOptie == 0) {
                this.oldPunten[0] = this.wedstrijd.spelers[0].stand.punten;
                this.oldPunten[1] = this.wedstrijd.spelers[1].stand.punten;
            }
            const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], '', 3);
            this.modals.push(modalMsg);
            this.showModal();
            return;
        }
        this.setMaxBeurten();
        this.setActiveTeamEnSpeler();
        if (this.isTeamWedstrijd()) {
            this.verhoogBeurtenEnBerekenData(this.activeSpeler, this.activeTeam);
        }
        else {
            this.verhoogBeurtenEnBerekenData(this.activeSpeler);
        }
        if (this.wedstrijd.telling.idxOptie == 0) {
            this.oldPunten[0] = this.wedstrijd.spelers[0].stand.punten;
            this.oldPunten[1] = this.wedstrijd.spelers[1].stand.punten;
        }
        this.checkForMessages(false, true);
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
        if (this.wedstrijd.regels.idxOptie != 1) {
            if (this.isTeamWedstrijd()) {
                if ((nr + this.activeTeam.stand.serie + this.activeTeam.stand.aantCar) > this.activeTeam.teamTsCar) {
                    return false;
                }        
            }
            else {
                if ((nr + this.activeSpeler.stand.serie + this.activeSpeler.stand.aantCar) > this.activeSpeler.splTsCar) {
                    return false;
                }        
            }
        }
        this.activeSpeler.stand.serie += nr;
        this.activeSpeler.stand.gemiddelde = this.getGemiddelde(this.activeSpeler);
        if (this.wedstrijd.telling.idxOptie == 0) {
            this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
        }
        if (this.isTeamWedstrijd()) {
            this.activeTeam.stand.serie += nr;
            this.activeTeam.stand.gemiddelde = this.getTeamGemiddelde(this.activeTeam);
        }
        if (nr > 0) {
            aantBereikt = this.checkForMessages(true);
            if (!aantBereikt && !this.testMode) {
                this.keysLocked = true;
                setTimeout(() => {
                    this.keysLocked = false;
                }, 3000);
            }
        }
        if (aantBereikt) {
            this.enterPressed();
        }
        return false;
    }

    private checkForMessages(fromSerie?: boolean, fromEnter?: boolean): boolean {
        if (this.isTeamWedstrijd()) {
            return this.checkForTeamMessages(fromSerie, fromEnter);
        }
        let msg: string[] = [];
        let spk = '';
        let msgType = 'info';
        if (!fromSerie) {
            // beurten - alleen checken voor speler 1
            if (this.idxSpeler === 0) {
                const remainingBrt = this.wedstrijd.regels.maxBeurten - this.activeSpeler.stand.aantBrt;
                if (remainingBrt === 1 && fromEnter) {
                    msg.push('Voorlaatste beurt');
                    spk = 'Voorlaatste beurt';
                }
                if (remainingBrt === 0 && fromEnter) {
                    msg.push('Laatste beurt');
                    spk = 'Laatste beurt';
                }
            }
            // gelijkmakende beurt
            if (this.wedstrijd.regels.idxOptie != 1) {
                let idx = this.findIndexEersteSpelerDieCarsHeeftBereikt();
                if (idx >= 0 && this.idxSpeler > idx) {
                    msg.push('Gelijkmakende beurt');
                    spk = 'Gelijkmakende beurt';
                }
            }
            // herhaal 'en nog ...' melding
            const remainingCar = this.activeSpeler.splTsCar - this.activeSpeler.stand.aantCar - this.activeSpeler.stand.serie;
            if (remainingCar > 0 && remainingCar < 4) {
                if (msg.length) {
                    msg.push(`${this.activeSpeler.splBordNaam} - nog ${remainingCar} ...`)
                    spk = spk + `. ${this.activeSpeler.splBordNaam}, nog ${remainingCar}.`;    
                }
                else {
                    msg.push(`${this.activeSpeler.splBordNaam} - nog ${remainingCar} ...`);
                    spk = `${this.activeSpeler.splSpreekNaam}. Nog ${remainingCar}.`;    
                }
            }
        }
        else if (fromSerie && this.wedstrijd.regels.idxOptie != 1) {
            const remainingCar = this.activeSpeler.splTsCar - this.activeSpeler.stand.aantCar - this.activeSpeler.stand.serie;
            if (remainingCar === 0) {
                return true;
            }
            else if (remainingCar < 4) {
                msg.push(`${this.activeSpeler.stand.serie}, en nog ${remainingCar} ...`);
                spk = `${this.activeSpeler.stand.serie}, en nog ${remainingCar}.`;
                msgType = 'carambole';
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

    private checkForTeamMessages(fromSerie?: boolean, fromEnter?: boolean): boolean {
        let msg: string[] = [];
        let spk = '';
        let msgType = 'info';
        if (!fromSerie) {
            // beurten - alleen checken voor speler 1
            if (this.idxTeam === 0 && this.idxSpeler === 0) {
                const remainingBrt = this.wedstrijd.regels.maxBeurten - this.activeSpeler.stand.aantBrt;
                if (remainingBrt === 1) {
                    msg.push('Voorlaatste beurt');
                    spk = 'Voorlaatste beurt';
                }
                if (remainingBrt === 0) {
                    msg.push('Laatste beurt');
                    spk = 'Laatste beurt';
                }
            }
            // gelijkmakende beurt
            if (this.wedstrijd.regels.idxOptie != 1) {
                if (this.idxTeam === 1 && this.wedstrijd.teams[0].stand.aantCar === this.wedstrijd.teams[0].teamTsCar) {
                    msg.push('Gelijkmakende beurt');
                    spk = 'Gelijkmakende beurt';
                }
            }
            // herhaal 'en nog ...' melding
            const remainingCar = this.activeTeam.teamTsCar - this.activeTeam.stand.aantCar - this.activeTeam.stand.serie;
            if (remainingCar > 0 && remainingCar < 4) {
                if (msg.length) {
                    msg.push(`${this.activeTeam.teamNaam} - nog ${remainingCar} ...`)
                    spk = spk + `. ${this.activeTeam.teamNaam}, nog ${remainingCar}.`;    
                }
                else {
                    msg.push(`${this.activeTeam.teamNaam} - nog ${remainingCar} ...`);
                    spk = `${this.activeTeam.teamNaam}, nog ${remainingCar}.`;    
                }
            }
        }
        else if (this.wedstrijd.regels.idxOptie != 1) {
            const remainingCar = this.activeTeam.teamTsCar - this.activeTeam.stand.aantCar - this.activeTeam.stand.serie;
            if (remainingCar === 0) {
                return true;
            }
            else if (remainingCar < 4) {
                msg.push(`${this.activeTeam.stand.serie}, en nog ${remainingCar} ...`);
                spk = `${this.activeTeam.stand.serie}, en nog ${remainingCar}.`;
            }
            else {
                msg.push(`${this.activeTeam.stand.serie}`);
                spk = `${this.activeTeam.stand.serie}`;
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

    private verhoogBeurtenEnBerekenData(spl: WedSpeler, team?: WedTeam): void {
        spl.stand.aantBrt++;
        spl.stand.gemiddelde = this.getGemiddelde(spl);
        if (this.wedstrijd.telling.idxOptie == 0) {
            spl.stand.punten = this.getPunten(spl);
        }
        if (team) {
            team.stand.aantBrt++;
            team.stand.gemiddelde = this.getTeamGemiddelde(team);
        }
    }

    private verminderBeurtenEnBerekenData(spl: WedSpeler, team?: WedTeam): void {
        spl.stand.aantBrt--;
        spl.stand.serie = 0;
        spl.stand.gemiddelde = this.getGemiddelde(spl);
        if (this.wedstrijd.telling.idxOptie == 0) {
            spl.stand.punten = this.getPunten(spl);
        }
        if (team) {
            team.stand.aantBrt--;
            team.stand.serie = 0;
            team.stand.gemiddelde = this.getTeamGemiddelde(team);
        }
    }

    private undoLaatsteBeurt(): boolean {
        if (this.isTeamWedstrijd()) {
            if (this.wedstrijd.teams[1].stand.aantBrt === 0) {
                return false;
            }    
        }
        else {
            if (this.wedstrijd.spelers[1].stand.aantBrt === 0) {
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
                this.activeTeam = this.wedstrijd.teams[1];
                this.activeTeam.actief = true;
                this.idxSpeler = this.activeTeam.spelers[0].stand.aantBrt === this.activeTeam.spelers[1].stand.aantBrt ? 1 : 0;
                this.activeSpeler = this.activeTeam.spelers[this.idxSpeler];
                this.activeSpeler.actief = true;
            }
            else {
                this.wedstrijd.spelers.forEach(spl => {
                    spl.actief = false;
                });
                this.idxSpeler = this.wedstrijd.aantSpelers - 1;
                this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
                this.activeSpeler.actief = true;
            }
        }
        else {
            // werk beurten en stand huidige speler bij
            this.activeSpeler.stand.aantBrt--;
            this.activeSpeler.stand.serie = 0;
            this.activeSpeler.stand.gemiddelde = this.getGemiddelde(this.activeSpeler);
            if (this.wedstrijd.telling.idxOptie == 0) {
                this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
                this.oldPunten[this.idxSpeler] = this.activeSpeler.stand.punten;
            }
            if (this.isTeamWedstrijd()) {
                this.activeTeam.stand.aantBrt--;
                this.activeTeam.stand.serie = 0;
                this.activeTeam.stand.gemiddelde = this.getTeamGemiddelde(this.activeTeam);
            }
            // maak vorige speler de huidige speler
            if (this.isTeamWedstrijd()) {
                this.activeTeam.actief = false;
                this.activeSpeler.actief = false;
                this.idxTeam = this.idxTeam === 1 ? 0 : 1;
                this.activeTeam = this.wedstrijd.teams[this.idxTeam];
                this.activeTeam.actief = true;
                if (this.idxTeam === 1) {
                    this.idxSpeler = this.idxSpeler === 1 ? 0 : 1;
                }
                this.activeSpeler = this.activeTeam.spelers[this.idxSpeler];
                this.activeSpeler.actief = true;        
            }
            else {
                let wasMetWit = this.activeSpeler.metWit;
                this.activeSpeler.actief = false;
                this.idxSpeler--;
                if (this.idxSpeler < 0) {
                    this.idxSpeler = this.wedstrijd.aantSpelers - 1;
                }
                this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
                this.activeSpeler.actief = true;    
                if (this.wedstrijd.aantSpelers == 3) {
                    this.activeSpeler.metWit = !wasMetWit;
                }
            }
        }
        let laatsteSerie = this.activeSpeler.stand.score.pop();
        if (!laatsteSerie) {
            laatsteSerie = 0;
        }
        this.activeSpeler.stand.serie = laatsteSerie;
        this.activeSpeler.stand.aantCar -= laatsteSerie;
        if (this.wedstrijd.telling.idxOptie == 0) {
            this.oldPunten[this.idxSpeler] = this.getOldPunten(this.activeSpeler);
        }
        // indien het gameover was werk punten bij van alle spelers
        if (wasWedOver && this.wedstrijd.telling.idxOptie == 0) {
            this.wedstrijd.spelers.forEach(spl => {
                spl.stand.punten = this.getPunten(spl);
            });
        }
        if (this.isTeamWedstrijd()) {
            let laatsteSerie = this.activeTeam.stand.score.pop();
            if (!laatsteSerie) {
                laatsteSerie = 0;
            }
            this.activeTeam.stand.serie = laatsteSerie;
            this.activeTeam.stand.aantCar -= laatsteSerie;
        }
        // werk hoogste serie bij
        if (laatsteSerie === this.activeSpeler.stand.hoogSer && laatsteSerie > 0) {
            let hoogste = 0;
            this.activeSpeler.stand.score.forEach(nr => {
                if (nr > hoogste) {
                    hoogste = nr;
                }
            });
            this.activeSpeler.stand.hoogSer = hoogste;
        }
        if (this.isTeamWedstrijd()) {
            if (laatsteSerie === this.activeTeam.stand.hoogSer && laatsteSerie > 0) {
                let hoogste = 0;
                this.activeTeam.stand.score.forEach(nr => {
                    if (nr > hoogste) {
                        hoogste = nr;
                    }
                });
                this.activeTeam.stand.hoogSer = hoogste;
            }
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
        if (this.isTeamWedstrijd()) {
            laatste5 = [];
            aant = 0;
            for (let i = this.activeTeam.stand.score.length - 1; i >= 0; i--) {
                laatste5.unshift(this.activeTeam.stand.score[i]);
                aant++;
                if (aant == 5) {
                    break;
                }
            }
            this.activeTeam.stand.laatste5brt = laatste5;    
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
        this.checkForMessages();
        this.opslaan.emit(copyOfWedstrijd);
        return false;
    }

    private resetInput(): boolean {
        this.addNumberToSerie('-' + this.activeSpeler.stand.serie);
        if (this.isTeamWedstrijd()) {
            this.addNumberToSerie('-' + this.activeTeam.stand.serie);
        }
        return false;
    }

    private getGemiddelde(spl: WedSpeler): number {
        if (spl.stand.aantBrt === 0) {
            return 0;
        }
        return (spl.stand.aantCar + spl.stand.serie) / spl.stand.aantBrt;
    }

    private getTeamGemiddelde(team: WedTeam): number {
        if (team.stand.aantBrt === 0) {
            return 0;
        }
        return (team.stand.aantCar + team.stand.serie) / team.stand.aantBrt;
    }

    private getPunten(spl: WedSpeler, idx?: number): number {
        let punten = 0;
        if (this.wedstrijd.telling.idxOptie == 0) {
            punten = Math.floor(10 * (spl.stand.aantCar + spl.stand.serie) / spl.splTsCar);
        }
        else {
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
            this.activeTeam = this.wedstrijd.teams[this.idxTeam];
            this.activeTeam.actief = true;
            this.activeSpeler = this.activeTeam.spelers[this.idxSpeler];
            this.activeSpeler.actief = true;
        }
        else {
            this.idxSpeler = this.wedstrijd.spelers.findIndex(spl => spl.actief);
            this.idxSpeler = (this.idxSpeler < 0) ? 0 : this.idxSpeler;
            this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.activeSpeler.actief = true;    
        }
    }

    private isWedstrijdOver(): boolean {
        if (this.isTeamWedstrijd()) {
            if (this.idxTeam === 0) {
                return false;
            }
            // het actieve team is nu dus het laatste team
            if (this.activeTeam.stand.aantBrt === 999) {
                return true;
            }
            if (this.idxTeam === 1 && this.idxSpeler === 1 && this.activeSpeler.stand.aantBrt === this.wedstrijd.regels.maxBeurten) {
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
            if (this.activeSpeler.stand.aantBrt === 999) {
                return true;
            }
            if (this.activeSpeler.stand.aantBrt === this.wedstrijd.regels.maxBeurten) {
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
            else if (this.wedstrijd.opslaanInComp && this.wedstrijd.wedGespeeld) {
                this.idxSpeler = -1;
                this.keyPressed.emit('Ready');
            }
        }
    }

}
