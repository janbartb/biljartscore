import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { Annonceer, AnnonSpeler, AnnonSerie, AnnonTeam } from '../../model/annonceer';
import { NgClass } from '@angular/common';
import { AnnonScoreSpelerLandscapeComponent } from "./annon-score-speler-landscape/annon-score-speler-landscape.component";
import { AnnonScoreSpelerComponent } from "./annon-score-speler/annon-score-speler.component";
import { SpeechService } from '../../services/speech.service';
import { AlertService } from '../../services/alert.service';
import { SpelerNamen, SpelerNamenDialog } from '../../model/dialogs';
import { ModalMessage } from '../../model/modal-message';
import { SpelersNamenComponent } from '../spelers-namen/spelers-namen.component';
import { HelpComponent } from '../help/help.component';
import { Apparaat } from '../../model/config';
import { StatusService } from '../../services/status.service';
import { AnnonScoreTeamComponent } from './annon-score-team/annon-score-team.component';

class ActieToetsen {
    beurtPlus: string[] = [];
    beurtMin: string[] = [];
    roodPlus: string[] = [];
    dirPlus: string[] = [];
    losPlus: string[] = [];
    eenPlus: string[] = [];
    tweePlus: string[] = [];
    driePlus: string[] = [];
    roodMin: string[] = [];
    dirMin: string[] = [];
    losMin: string[] = [];
    eenMin: string[] = [];
    tweeMin: string[] = [];
    drieMin: string[] = [];
}

@Component({
    selector: 'app-annon-score',
    standalone: true,
    imports: [
        NgClass,
        SpelersNamenComponent,
        HelpComponent,
        AnnonScoreSpelerLandscapeComponent,
        AnnonScoreSpelerComponent,
        AnnonScoreTeamComponent
    ],
    templateUrl: './annon-score.component.html',
    styleUrl: './annon-score.component.css'
})
export class AnnonScoreComponent implements OnInit {
    spraak = inject(SpeechService);
    alert = inject(AlertService);
    appData = inject(StatusService);

    @Input() wedstrijd: Annonceer = new Annonceer();
    @Output() opslaan: EventEmitter<Annonceer> = new EventEmitter<Annonceer>();
    @Output() keyPressed: EventEmitter<string> = new EventEmitter<string>();

    activeTeam: AnnonTeam = new AnnonTeam(0);
    activeSpeler: AnnonSpeler = new AnnonSpeler(0);
    namenDialog: SpelerNamenDialog = new SpelerNamenDialog();
    modals: ModalMessage[] = [];
    idxTeam: number = -1;
    idxSpeler: number = -1;
    toetsen: ActieToetsen = new ActieToetsen();
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
        this.werkScoreSpelerBij(this.activeSpeler);
        this.activeSpeler.stand.scores.push(this.activeSpeler.stand.serie);
        this.activeSpeler.stand.serie = new AnnonSerie(this.wedstrijd.config.cats.length);
        if (this.isTeamWedstrijd()) {
            this.werkScoreTeamBij(this.activeTeam);
            this.activeTeam.stand.scores.push(this.activeTeam.stand.serie);
            this.activeTeam.stand.serie = new AnnonSerie(this.wedstrijd.config.cats.length);
        }
    }

    followUpEnter() {
        // check for einde wedstrijd
        if (this.isWedstrijdOver()) {
            this.wedstrijd.wedGespeeld = true;
            this.wedstrijd.spelers.forEach(spl => spl.actief = true);
            this.wedstrijd.teams.forEach(team => {
                team.actief = true;
                team.spelers.forEach(spl => spl.actief = true);
            });
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
            this.activeSpeler.actief = false;
            this.idxSpeler++;
            if (this.idxSpeler >= this.wedstrijd.config.aantSpelers) {
                this.idxSpeler = 0;
            }
            this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.activeSpeler.actief = true;
        }

        const copyOfWedstrijd: Annonceer = JSON.parse(JSON.stringify(this.wedstrijd));
        let msg = '';
        if (this.isTeamWedstrijd()) {
            this.activeTeam.stand.aantBrt++;
            this.activeSpeler.stand.aantBrt++;
            if (this.idxTeam == 0 && this.activeTeam.stand.aantBrt == 999) {
                msg = 'Laatste beurt';
            }
        }
        else {
            this.activeSpeler.stand.aantBrt++;
            if (this.idxSpeler == 0 && this.activeSpeler.stand.aantBrt == 999) {
                msg = 'Laatste beurt';
            }
        }
        if (msg.length) {
            const modalMsg = new ModalMessage('info', [msg], msg, 3);
            this.modals.push(modalMsg);
            this.showModal();
        }
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
        let result = undefined;
        if (this.isTeamWedstrijd()) {
            this.wedstrijd.teams.forEach(team => {
                let speler = team.spelers.find(spl => spl.splId == id);
                if (speler) {
                    result = speler;
                }
            });
        }
        else {
            result = this.wedstrijd.spelers.find(spl => spl.splId == id);
        }
        return result;
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
        if (event.key === 'Escape') {
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
        if (event.code === 'KeyH') {
            this.alert.showHelp();
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
            if (this.toetsen.roodPlus.indexOf(event.code) >= 0) {
                this.addToSerie(this.wedstrijd.config.isAnnonceer ? 0 : -1);
                return false;
            }
            if (this.toetsen.dirPlus.indexOf(event.code) >= 0) {
                this.addToSerie(this.wedstrijd.config.isAnnonceer ? 1 : 0);
                return false;
            }
            if (this.toetsen.eenPlus.indexOf(event.code) >= 0) {
                this.addToSerie(this.wedstrijd.config.isAnnonceer ? -1 : 1);
                return false;
            }
            if (this.toetsen.tweePlus.indexOf(event.code) >= 0) {
                this.addToSerie(this.wedstrijd.config.isAnnonceer ? -1 : 2);
                return false;
            }
            if (this.toetsen.driePlus.indexOf(event.code) >= 0) {
                this.addToSerie(this.wedstrijd.config.isAnnonceer ? 3 : 3);
                return false;
            }
            if (this.toetsen.losPlus.indexOf(event.code) >= 0) {
                this.addToSerie(this.wedstrijd.config.isAnnonceer ? 2 : 4);
                return false;
            }

            if (this.toetsen.roodMin.indexOf(event.code) >= 0) {
                this.removeFromSerie(this.wedstrijd.config.isAnnonceer ? 0 : -1);
                return false;
            }
            if (this.toetsen.dirMin.indexOf(event.code) >= 0) {
                this.removeFromSerie(this.wedstrijd.config.isAnnonceer ? 1 : 0);
                return false;
            }
            if (this.toetsen.eenMin.indexOf(event.code) >= 0) {
                this.removeFromSerie(this.wedstrijd.config.isAnnonceer ? -1 : 1);
                return false;
            }
            if (this.toetsen.tweeMin.indexOf(event.code) >= 0) {
                this.removeFromSerie(this.wedstrijd.config.isAnnonceer ? -1 : 2);
                return false;
            }
            if (this.toetsen.drieMin.indexOf(event.code) >= 0) {
                this.removeFromSerie(this.wedstrijd.config.isAnnonceer ? 3 : 3);
                return false;
            }
            if (this.toetsen.losMin.indexOf(event.code) >= 0) {
                this.removeFromSerie(this.wedstrijd.config.isAnnonceer ? 2 : 4);
                return false;
            }
        }
        return true;
    }

    ngOnInit(): void {
        const apparaten: Apparaat[] = this.appData.getConfig()?.apparaten || [];
        const toetsenOk = this.setActieToetsen(apparaten, this.wedstrijd.config.isAnnonceer);
        if (!toetsenOk) {
            this.alert.showAlert('Apparaten configuratie niet gevonden. Default toetsen worden gebruikt.', 'warning', 5);
            this.setDefaultActieToetsen(this.wedstrijd.config.isAnnonceer);
        }
        if (this.wedstrijd.wedGespeeld) {
            const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], '', 3);
            this.modals.push(modalMsg);
            this.showModal();
            return;
        }
        this.setActiveSpeler();
        this.activeSpeler.stand.aantBrt++;
        if (this.isTeamWedstrijd()) {
            this.activeTeam.stand.aantBrt++;
        }
    }

    private addToSerie(idxCat: number): boolean {
        if (this.keysLocked && !this.testMode) {
            return false;
        }
        if (idxCat == -1) {
            return false;
        }
        let msgType = 'info';
        let msg = this.wedstrijd.config.cats[idxCat].naam;
        let spk = this.wedstrijd.config.cats[idxCat].spkNaam;
        let aantalWasTeam = 0;
        let aantalBijTeam = 0;
        let aantalTotTeam = 0;
        const aantalWas = this.activeSpeler.stand.totaal.cars[idxCat];
        let aantalBij = this.activeSpeler.stand.serie.cars[idxCat];
        let aantalTot = aantalWas + aantalBij;
        if (this.isTeamWedstrijd()) {
            aantalWasTeam = this.activeTeam.stand.totaal.cars[idxCat];
            aantalBijTeam = this.activeTeam.stand.serie.cars[idxCat];
            aantalTotTeam = aantalWasTeam + aantalBijTeam;
        }
        if (this.isTeamWedstrijd()) {
            if (aantalTotTeam < this.activeTeam.teamTsCar) {
                this.activeSpeler.stand.serie.cars[idxCat]++;
                this.activeTeam.stand.serie.cars[idxCat]++;
                aantalBijTeam++;
                aantalTotTeam++;
                const remaining = this.activeTeam.teamTsCar - aantalTotTeam;
                if (remaining == 0) {
                    msg += ' is vol';
                    spk += ' is vol';
                }
                else if (remaining < 4) {
                    msg += ': ' + aantalBijTeam + ' - nog ' + remaining;
                    spk += ', ' + aantalBijTeam + ', en nog ' + remaining;
                }
                else {
                    msg += ': ' + aantalBijTeam;
                    spk += ', ' + aantalBijTeam;
                }
            }
            else {
                msg += ' is al vol';
                spk += ' is al vol';
            }
        }
        else {
            if (aantalTot < this.activeSpeler.splTsCar) {
                this.activeSpeler.stand.serie.cars[idxCat]++;
                aantalBij++;
                aantalTot++;
                const remaining = this.activeSpeler.splTsCar - aantalTot;
                if (remaining == 0) {
                    msg += ' is vol';
                    spk += ' is vol';
                }
                else if (remaining < 4) {
                    msg += ': ' + aantalBij + ' - nog ' + remaining;
                    spk += ', ' + aantalBij + ', en nog ' + remaining;
                }
                else {
                    msg += ': ' + aantalBij;
                    spk += ', ' + aantalBij;
                }
            }
            else {
                msg += ' is al vol';
                spk += ' is al vol';
            }
        }

        const modalMsg = new ModalMessage(msgType, [msg], spk, 3);
        this.modals.push(modalMsg);
        this.showModal();
        if (this.isTeamWedstrijd()) {
            if (this.teamHeeftAllesVol(this.activeTeam)) {
                this.enterPressed();
                return false;
            }
        }
        else {
            if (this.spelerHeeftAllesVol(this.activeSpeler)) {
                this.enterPressed();
                return false;
            }
        }
        if (!this.testMode) {
            this.keysLocked = true;
            setTimeout(() => {
                this.keysLocked = false;
            }, 3000);
        }
        return false;
    }

    private removeFromSerie(idxCat: number): boolean {
        if (this.keysLocked && !this.testMode) {
            return false;
        }
        if (this.activeSpeler.stand.serie.cars[idxCat] > 0) {
            this.activeSpeler.stand.serie.cars[idxCat]--;
            if (this.isTeamWedstrijd()) {
                this.activeTeam.stand.serie.cars[idxCat]--;
            }
        }
        return false;
    }

    private undoLaatsteBeurt(): boolean {
        if (this.isTeamWedstrijd()) {
            if (this.wedstrijd.teams[1].stand.aantBrt === 0) {
                return false;
            }
        }
        else {
            if (this.wedstrijd.spelers.length == 1) {
                if (this.wedstrijd.spelers[0].stand.aantBrt === 1) {
                    return false;
                }
            }
            else {
                if (this.wedstrijd.spelers[1].stand.aantBrt === 0) {
                    return false;
                }    
            }
        }
        const wasWedOver = this.wedstrijd.wedGespeeld;
        if (this.wedstrijd.wedGespeeld) {
            this.wedstrijd.wedGespeeld = false;
            // alle spelers zijn actief dus allen inactiveren behalve de laatse; die blijft actief
            if (this.isTeamWedstrijd()) {
                this.wedstrijd.teams.forEach(team => {
                    team.actief = false;
                    team.spelers.forEach(spl => spl.actief = false);
                });
                this.idxTeam = 1;
                this.idxSpeler = 1;
                this.activeTeam = this.wedstrijd.teams[this.idxTeam];
                this.activeSpeler = this.activeTeam.spelers[this.idxSpeler];
                this.activeTeam.actief = true;
                this.activeSpeler.actief = true;
            }
            else {
                this.wedstrijd.spelers.forEach(spl => {
                    spl.actief = false;
                });
                this.idxSpeler = this.wedstrijd.config.aantSpelers - 1;
                this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
                this.activeSpeler.actief = true;
            }
        }
        else {
            // werk beurten en stand huidige speler bij
            this.activeSpeler.stand.aantBrt--;
            this.activeSpeler.stand.serie = new AnnonSerie(this.wedstrijd.config.cats.length);
            if (this.isTeamWedstrijd()) {
                this.activeTeam.stand.aantBrt--;
                this.activeTeam.stand.serie = new AnnonSerie(this.wedstrijd.config.cats.length);
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
                this.activeSpeler.actief = false;
                this.idxSpeler--;
                if (this.idxSpeler < 0) {
                    this.idxSpeler = this.wedstrijd.config.aantSpelers - 1;
                }
                this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
                this.activeSpeler.actief = true;    
            }
        }
        let laatsteSerie = this.activeSpeler.stand.scores.pop();
        if (this.isTeamWedstrijd()) {
            laatsteSerie = this.activeTeam.stand.scores.pop();
        }
        if (!laatsteSerie) {
            laatsteSerie = new AnnonSerie(this.wedstrijd.config.cats.length);
        }
        this.activeSpeler.stand.serie = laatsteSerie;
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
            this.activeSpeler.stand.totaal.cars[i] -= laatsteSerie.cars[i];
        }
        this.activeSpeler.stand.punten = this.getPunten(this.activeSpeler);
        if (this.isTeamWedstrijd()) {
            this.activeTeam.stand.serie = laatsteSerie;
            for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
                this.activeTeam.stand.totaal.cars[i] -= laatsteSerie.cars[i];
            }
            this.activeTeam.stand.punten = this.getTeamPunten(this.activeTeam);
        }

        const copyOfWedstrijd: Annonceer = JSON.parse(JSON.stringify(this.wedstrijd));
        if (this.isTeamWedstrijd()) {
            copyOfWedstrijd.teams[this.idxTeam].stand.aantBrt--;
            copyOfWedstrijd.teams[this.idxTeam].spelers[this.idxSpeler].stand.aantBrt--;
        }
        else {
            copyOfWedstrijd.spelers[this.idxSpeler].stand.aantBrt--;
        }
        //this.checkForMessages();
        this.opslaan.emit(copyOfWedstrijd);
        return false;
    }

    private isWedstrijdOver(): boolean {
        if (this.isTeamWedstrijd()) {
            if (this.idxTeam == 0) {
                if (this.teamHeeftAllesVol(this.activeTeam)) {
                    const msg = 'Gelijkmakende beurt';
                    const modalMsg = new ModalMessage('info', [msg], msg, 3);
                    this.modals.push(modalMsg);
                    this.showModal();
                }
                return false;
            }
            // het actieve team is nu dus het laatste team
            if (this.activeTeam.stand.aantBrt === 999) {
                return true;
            }
            return this.wedstrijd.teams.some(team => this.teamHeeftAllesVol(team));
        }
        else {
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
    }

    private werkScoreSpelerBij(speler: AnnonSpeler) {
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
           speler.stand.totaal.cars[i] += speler.stand.serie.cars[i];
        }
        speler.stand.punten = this.getPunten(speler);
    }

    private werkScoreTeamBij(team: AnnonTeam) {
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
           team.stand.totaal.cars[i] += team.stand.serie.cars[i];
        }
        team.stand.punten = this.getTeamPunten(team);
    }

    private getPunten(speler: AnnonSpeler): number {
        let result = 0;
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
            if (speler.stand.totaal.cars[i] == speler.splTsCar) {
                result++;
            }
        }
        if (result == this.wedstrijd.config.cats.length) {
            result++;
        }
        return result;
    }

    private getTeamPunten(team: AnnonTeam): number {
        let result = 0;
        for (let i = 0; i < this.wedstrijd.config.cats.length; i++) {
            if (team.stand.totaal.cars[i] == team.teamTsCar) {
                result++;
            }
        }
        if (result == this.wedstrijd.config.cats.length) {
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

    private teamHeeftAllesVol(team: AnnonTeam): boolean {
        return this.wedstrijd.config.cats.every((cat, idx) => {
            return team.stand.totaal.cars[idx] + team.stand.serie.cars[idx] == team.teamTsCar;
        });
    }

    private setActiveSpeler() {
        if (this.isTeamWedstrijd()) {
            this.idxTeam = this.wedstrijd.teams.findIndex(team => team.actief);
            this.idxTeam = (this.idxTeam < 0) ? 0 : this.idxTeam;
            this.activeTeam = this.wedstrijd.teams[this.idxTeam];
            this.activeTeam.actief = true;
            this.idxSpeler = this.activeTeam.spelers.findIndex(spl => spl.actief);
            this.idxSpeler = (this.idxSpeler < 0) ? 0 : this.idxSpeler;
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

    private getAnnonSpelers(): SpelerNamen[] {
        let result: SpelerNamen[] = [];
        if (this.isTeamWedstrijd()) {
            this.wedstrijd.teams.forEach(team => {
                team.spelers.forEach(spl => {
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

    private isTeamWedstrijd(): boolean {
        return this.wedstrijd.config.aantSpelers == 5;
    }

    private setActieToetsen(apparaten: Apparaat[], isAnnon: boolean): boolean {
        if (!apparaten.length) {
            return false;
        }
        let obj: any = {
            beurtPlus: [],
            beurtMin: [],
            roodPlus: [],
            dirPlus: [],
            eenPlus: [],
            tweePlus: [],
            driePlus: [],
            losPlus: [],
            roodMin: [],
            dirMin: [],
            eenMin: [],
            tweeMin: [],
            drieMin: [],
            losMin: []
        };
        const gekozenSpel = isAnnon ? 'ANN' : 'PEN';
        apparaten.forEach(apparaat => {
            const spel = apparaat.spelen.find(sp => sp.id == gekozenSpel);
            if (spel) {
                spel.acties.forEach(actie => {
                    obj[actie.id].push(actie.code);
                });
            }
        });
        if (!(obj.beurtPlus.length && obj.beurtMin.length && obj.dirPlus.length && obj.dirMin.length 
                    && obj.losPlus.length && obj.losMin.length && obj.driePlus.length && obj.drieMin.length)) {
            return false;
        }
        if (isAnnon) {
            if (!(obj.roodPlus.length && obj.roodMin.length)) {
                return false;
            }
        }
        else {
            if (!(obj.eenPlus.length && obj.eenMin.length && obj.tweePlus.length && obj.tweeMin.length)) {
                return false;
            }
        }
        Object.assign(this.toetsen, obj);
        console.log(this.toetsen);
        return true;
    }

    private setDefaultActieToetsen(isAnnon: boolean) {
        this.toetsen.beurtPlus = ['Enter', 'NumpadEnter'];
        this.toetsen.beurtMin = ['Period', 'NumpadSubtract'];
        if (isAnnon) {
            this.toetsen.roodPlus = ['Digit2', 'Numpad7'];
            this.toetsen.dirPlus = ['Digit3', 'Numpad4'];
            this.toetsen.losPlus = ['Digit4', 'Numpad1'];
            this.toetsen.eenPlus = ['', ''];
            this.toetsen.tweePlus = ['', ''];
            this.toetsen.driePlus = ['Digit5', 'Numpad0'];
            this.toetsen.roodMin = ['Digit7', 'Numpad9'];
            this.toetsen.dirMin = ['Digit8', 'Numpad6'];
            this.toetsen.losMin = ['Digit9', 'Numpad3'];
            this.toetsen.eenMin = ['', ''];
            this.toetsen.tweeMin = ['', ''];
            this.toetsen.drieMin = ['Digit0', 'NumpadDecimal'];
        }
        else {
            this.toetsen.roodPlus = ['', ''];
            this.toetsen.dirPlus = ['Digit1', 'Backspace'];
            this.toetsen.eenPlus = ['Digit2', 'Numpad7'];
            this.toetsen.tweePlus = ['Digit3', 'Numpad4'];
            this.toetsen.driePlus = ['Digit4', 'Numpad1'];
            this.toetsen.losPlus = ['Digit5', 'Numpad0'];
            this.toetsen.roodMin = ['', ''];
            this.toetsen.dirMin = ['Digit6', 'NumpadMultiply'];
            this.toetsen.eenMin = ['Digit7', 'Numpad9'];
            this.toetsen.tweeMin = ['Digit8', 'Numpad6'];
            this.toetsen.drieMin = ['Digit9', 'Numpad3'];
            this.toetsen.losMin = ['Digit0', 'NumpadDecimal'];
        }
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
