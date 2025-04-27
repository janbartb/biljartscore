import { Component, HostListener, inject, OnInit } from '@angular/core';
import { WedSpeler, Wedstrijd, WedTeam } from '../../../model/wedstrijd';
import { BaseComponent } from '../../../base/base.component';
import { NgClass } from '@angular/common';
import { WedScoreSpelerComponent } from './wed-score-speler/wed-score-speler.component';
import { ModalMessage } from '../../../model/modal-message';
import { WedScoreSpelerLandscapeComponent } from './wed-score-speler-landscape/wed-score-speler-landscape.component';
import { WedScoreTeamComponent } from './wed-score-team/wed-score-team.component';
import { SpeechService } from '../../../services/speech.service';
import { HelpComponent } from '../../../shared/help/help.component';
import { SpelerNamen, SpelerNamenDialog } from '../../../model/dialogs';
import { SpelersNamenComponent } from '../../../shared/spelers-namen/spelers-namen.component';

@Component({
    selector: 'app-wed-score',
    standalone: true,
    imports: [
        WedScoreSpelerComponent,
        WedScoreSpelerLandscapeComponent,
        WedScoreTeamComponent,
        SpelersNamenComponent,
        HelpComponent,
        NgClass
    ],
    templateUrl: './wed-score.component.html',
    styleUrl: './wed-score.component.css'
})
export class WedScoreComponent extends BaseComponent implements OnInit {
    spraak = inject(SpeechService);
    wedstrijd: Wedstrijd = new Wedstrijd();
    activeTeam: WedTeam = new WedTeam(-1, '');
    activeSpeler: WedSpeler = new WedSpeler(-1);
    namenDialog: SpelerNamenDialog = new SpelerNamenDialog();
    modals: ModalMessage[] = [];
    idxTeam: number = -1;
    idxSpeler: number = -1;
    busyCounter: number = 0;

    wedGelezen: boolean = false;
    busy: boolean = false;
    modalVisible: boolean = false;
    keysLocked: boolean = false;
    testMode: boolean = false;
    testModeToggled: boolean = false;
    speechToggled: boolean = false;

    enterPressed(): void {
        if (this.wedstrijd.wedOver) {
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
        // check for end of game
        if (this.isWedstrijdOver()) {
            this.wedstrijd.wedOver = true;
            if (this.isTeamWedstrijd()) {
                this.wedstrijd.teams.forEach(team => {
                    team.active = true;
                    team.spelers.forEach(spl => spl.active = true);
                });
            }
            else {
                this.wedstrijd.spelers.forEach(spl => spl.active = true);
            }
            this.idxTeam = -1;
            this.idxSpeler = -1;
            this.saveWedstrijd(this.wedstrijd);
            const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], 'Einde wedstrijd', 3);
            this.modals.push(modalMsg);
            this.showModal();
            return;
        }
        // switch actieve speler
        if (this.isTeamWedstrijd()) {
            this.activeTeam.active = false;
            this.activeSpeler.active = false;
            if (this.idxTeam == 0) {
                this.idxTeam = 1;
            }
            else {
                this.idxTeam = 0;
                this.idxSpeler = this.idxSpeler == 0 ? 1 : 0;
            }
            this.activeTeam = this.wedstrijd.teams[this.idxTeam];
            this.activeSpeler = this.wedstrijd.teams[this.idxTeam].spelers[this.idxSpeler];
            this.activeTeam.active = true;
            this.activeSpeler.active = true;
        }
        else {
            const wasWit = this.activeSpeler.metWit;
            this.activeSpeler.active = false;
            this.idxSpeler++;
            if (this.idxSpeler >= this.wedstrijd.aantSpelers) {
                this.idxSpeler = 0;
            }
            this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.activeSpeler.active = true;
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
        this.checkForMessages(false, true);
        this.saveWedstrijd(copyOfWedstrijd);
    }

    resetBusy() {
        this.busy = false;
    }

    wijzigNamenPressed() {
        this.naamClicked(this.activeSpeler);
    }

    naamClicked(spl: WedSpeler) {
        console.log('naam clicked ' + spl.splNaam);
        this.namenDialog.selSpelerId = spl.splId;
        this.namenDialog.spelers = this.getWedSpelers();
        this.isDialogOpen = true;
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
        if (this.busy) {
            return false;
        }
        if (this.alert.helpVisible && event.key != 'Shift') {
            this.alert.hideHelp();
            return false;
        }        
        // if (event.key === 'Enter') {
        //     this.enterPressed();
        //     return false;
        // }
        if (event.key === 'Escape' || event.key === 'Backspace' || event.code == 'F5') {
            if (this.activeSpeler.stand.serie > 0) {
                this.addNumberToSerie('-1');
            }
            else {
                this.router.navigate(['wedstrijd']);
            }
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
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
            this.appData.gotoPage(this.router.url, 'wedstrijd/lijst');
            return false;
        }
        if (event.key === 'Delete' || event.code === 'NumpadDecimal' || event.code == 'Period') {
            this.undoLaatsteBeurt();
            return false;
        }
        if (!this.wedstrijd.wedOver) {
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
        this.bssApi.getWedstrijd()
        .then(resp => {
            if (!resp.gevonden) {
                console.log('Match niet gevonden. Vreemd...');
                this.router.navigate(['wedstrijd']);
                return;
            }
            this.wedstrijd = resp.wedstrijd;
            console.log(this.wedstrijd);
            if (this.wedstrijd.wedOver) {
                this.wedGelezen = true;
                const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], '', 3);
                this.modals.push(modalMsg);
                this.showModal();
            }
            else {
                this.setActiveTeamEnSpeler();
                if (this.isTeamWedstrijd()) {
                    this.verhoogBeurtenEnBerekenData(this.activeSpeler, this.activeTeam);
                }
                else {
                    this.verhoogBeurtenEnBerekenData(this.activeSpeler);
                }
                this.wedGelezen = true;
                this.checkForMessages(false, true);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
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
        if (!this.wedstrijd.isVastAantBrt) {
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
                let maxBeurten = this.getMaxBeurten();
                const remainingBrt = maxBeurten - this.activeSpeler.stand.aantBrt;
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
            if (!this.wedstrijd.isVastAantBrt) {
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
        else if (fromSerie && !this.wedstrijd.isVastAantBrt) {
            const remainingCar = this.activeSpeler.splTsCar - this.activeSpeler.stand.aantCar - this.activeSpeler.stand.serie;
            if (remainingCar === 0) {
                return true;
            }
            else if (remainingCar < 4) {
                msg.push(`${this.activeSpeler.stand.serie}, en nog ${remainingCar} ...`);
                spk = `${this.activeSpeler.stand.serie}, en nog ${remainingCar}.`;
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
                let maxBeurten = this.getMaxBeurten();
                const remainingBrt = maxBeurten - this.activeSpeler.stand.aantBrt;
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
            if (!this.wedstrijd.isVastAantBrt) {
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
        else if (!this.wedstrijd.isVastAantBrt) {
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

    private eenVanDeTeamsHeeftCarsBereikt(): boolean {
        return this.wedstrijd.teams.some(team => team.stand.aantCar === team.teamTsCar);
    }

    private eenVanDeSpelersHeeftCarsBereikt(): boolean {
        return this.wedstrijd.spelers.some(spl => spl.stand.aantCar === spl.splTsCar);
    }

    private findIndexEersteSpelerDieCarsHeeftBereikt(): number {
        return this.wedstrijd.spelers.findIndex(spl => spl.stand.aantCar === spl.splTsCar);
    }

    private findIndexEersteTeamDieCarsHeeftBereikt(): number {
        return this.wedstrijd.teams.findIndex(team => team.stand.aantCar === team.teamTsCar);
    }

    private getMaxBeurten(): number {
        let result = 0;
        if (this.wedstrijd.isVastAantBrt) {
            result = this.wedstrijd.tsBeurten;
        }
        else {
            result = this.wedstrijd.maxBeurten;
            if (result == 0) {
                result = 500;
            }
        }
        return result;
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

    private verhoogBeurtenEnBerekenData(spl: WedSpeler, team?: WedTeam): void {
        spl.stand.aantBrt++;
        spl.stand.gemiddelde = this.getGemiddelde(spl);
        if (team) {
            team.stand.aantBrt++;
            team.stand.gemiddelde = this.getTeamGemiddelde(team);
        }
    }

    private verminderBeurtenEnBerekenData(spl: WedSpeler, team?: WedTeam): void {
        spl.stand.aantBrt--;
        spl.stand.serie = 0;
        spl.stand.gemiddelde = this.getGemiddelde(spl);
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
        const wasWedOver = this.wedstrijd.wedOver;
        if (this.wedstrijd.wedOver) {
            this.wedstrijd.wedOver = false;
            // alle spelers zijn actief dus allen inactiveren behalve de laatse; die blijft actief
            if (this.isTeamWedstrijd()) {
                this.wedstrijd.teams.forEach(team => {
                    team.active = false;
                    team.spelers.forEach(spl => {
                        spl.active = false;
                    });
                });
                this.idxTeam = 1;
                this.activeTeam = this.wedstrijd.teams[1];
                this.activeTeam.active = true;
                this.idxSpeler = this.activeTeam.spelers[0].stand.aantBrt === this.activeTeam.spelers[1].stand.aantBrt ? 1 : 0;
                this.activeSpeler = this.activeTeam.spelers[this.idxSpeler];
                this.activeSpeler.active = true;
            }
            else {
                this.wedstrijd.spelers.forEach(spl => {
                    spl.active = false;
                });
                this.idxSpeler = this.wedstrijd.aantSpelers - 1;
                this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
                this.activeSpeler.active = true;
            }
        }
        else {
            // werk beurten en stand huidige speler bij
            this.activeSpeler.stand.aantBrt--;
            this.activeSpeler.stand.serie = 0;
            this.activeSpeler.stand.gemiddelde = this.getGemiddelde(this.activeSpeler);
            if (this.isTeamWedstrijd()) {
                this.activeTeam.stand.aantBrt--;
                this.activeTeam.stand.serie = 0;
                this.activeTeam.stand.gemiddelde = this.getTeamGemiddelde(this.activeTeam);
            }
            // maak vorige speler de huidige speler
            if (this.isTeamWedstrijd()) {
                this.activeTeam.active = false;
                this.activeSpeler.active = false;
                this.idxTeam = this.idxTeam === 1 ? 0 : 1;
                this.activeTeam = this.wedstrijd.teams[this.idxTeam];
                this.activeTeam.active = true;
                if (this.idxTeam === 1) {
                    this.idxSpeler = this.idxSpeler === 1 ? 0 : 1;
                }
                this.activeSpeler = this.activeTeam.spelers[this.idxSpeler];
                this.activeSpeler.active = true;        
            }
            else {
                let wasMetWit = this.activeSpeler.metWit;
                this.activeSpeler.active = false;
                this.idxSpeler--;
                if (this.idxSpeler < 0) {
                    this.idxSpeler = this.wedstrijd.aantSpelers - 1;
                }
                this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
                this.activeSpeler.active = true;    
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
        this.saveWedstrijd(copyOfWedstrijd);
        return false;
    }

    private resetInput(): boolean {
        this.addNumberToSerie('-' + this.activeSpeler.stand.serie);
        if (this.isTeamWedstrijd()) {
            this.addNumberToSerie('-' + this.activeTeam.stand.serie);
        }
        return false;
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
            let maxBeurten: number = this.getMaxBeurten();
            if (this.idxTeam === 1 && this.idxSpeler === 1 && this.activeSpeler.stand.aantBrt === maxBeurten) {
                return true;
            }
            if (!this.wedstrijd.isVastAantBrt) {
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
            let maxBeurten: number = this.getMaxBeurten();
            if (this.activeSpeler.stand.aantBrt === maxBeurten) {
                return true;
            }
            if (!this.wedstrijd.isVastAantBrt) {
                if (this.eenVanDeSpelersHeeftCarsBereikt()) {
                    return true;
                }
            }
        }
        return false;
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
        }
    }

    private saveWedstrijd(wedstrijd: Wedstrijd) {
        this.busy = true;
        this.bssApi.saveWedstrijd(wedstrijd)
        .then(() => {
            this.busy = false;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private setActiveTeamEnSpeler() {
        if (this.isTeamWedstrijd()) {
            this.idxTeam = this.wedstrijd.teams.findIndex(team => team.active);
            if (this.idxTeam >= 0) {
                this.idxSpeler = this.wedstrijd.teams[this.idxTeam].spelers.findIndex(spl => spl.active);
            }
            this.activeTeam = this.wedstrijd.teams[this.idxTeam];
            this.activeTeam.active = true;
            this.activeSpeler = this.activeTeam.spelers[this.idxSpeler];
            this.activeSpeler.active = true;
        }
        else {
            this.idxSpeler = this.wedstrijd.spelers.findIndex(spl => spl.active);
            this.activeSpeler = this.wedstrijd.spelers[this.idxSpeler];
            this.activeSpeler.active = true;    
        }
    }

    private isWedstrijdGestart(): boolean {
        if (this.isTeamWedstrijd()) {
            return this.wedstrijd.teams[0].spelers[0].stand.aantBrt > 0;
        }
        else {
            return this.wedstrijd.spelers[0].stand.aantBrt > 0;
        }
    }

    private isTeamWedstrijd(): boolean {
        return this.wedstrijd.aantSpelers == 5;
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

}
