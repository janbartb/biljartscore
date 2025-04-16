import { Component, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { CmpMatchSpeler, CmpMatchSpelerStand, CmpSplRonde, CmpSplWedstrijd, Competitie, CompetitieMatch } from '../../../../model/competitie';
import { HelperService } from '../../../../services/helper.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { isIntegerNotNegative, validDateNotFuture } from '../../../../directives/validators.directive';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { Menu, MenuAction } from '../../../../model/menu';
import { MenuActionComponent } from '../../../../shared/menu/menu-action/menu-action.component';
import { Button } from '../../../../model/button';
import { ButtonComponent } from '../../../../shared/button-group/button/button.component';
import { Alinea, ConfirmDialog } from '../../../../model/dialogs';
import { ConfirmComponent } from '../../../../shared/confirm/confirm.component';

@Component({
    selector: 'app-eigen-competitie-match',
    standalone: true,
    imports: [
        PageHeaderComponent,
        MenuActionComponent,
        ReactiveFormsModule,
        ConfirmComponent,
        ButtonComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './eigen-competitie-match.component.html',
    styleUrl: './eigen-competitie-match.component.css'
})
export class EigenCompetitieMatchComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);
    helper = inject(HelperService);
    title: string = '';
    subtitle: string = 'Wedstrijd';
    menu: Menu = new Menu();
    comp: Competitie = new Competitie('');
    match: CompetitieMatch = new CompetitieMatch();
    comments: string[] = ['Nieuwe wedstrijd', 'Wedstrijd is gespeeld', 'Wedstrijd is nog bezig'];
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);
    isOpnieuwDialogOpen: boolean = false;
    idxComm: number = 0;
    idxRonde: number = -1;
    idxSpl: number = -1;
    idxTeg: number = -1;
    firstSaveMatch: boolean = false;
    uitslagOk: boolean = false;
    viewMode: boolean = true;
    dataReady: boolean = false;
    escapeCount: number = 0;
    enterButton: Button = new Button('Enter', 'Opslaan', true);
    matchForm!: FormGroup;

    htmlInputDatum = viewChild<ElementRef<HTMLInputElement>>("weddatum");

    override escapePressed(): void {
        if (!this.viewMode) {
            this.matchForm.reset();
            this.matchForm.disable();
            this.viewMode = true;
            this.escapeCount = 0;
            return;
        }
        this.router.navigate([`eigencomps/${this.comp.cmpNaam}/schema/${this.idxRonde}`]);
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            this.uitslagOpslaanClicked();
        }, 300);
    }

    actionPressed(shortcut: string) {
        let action = this.menu.getSelectedAction();
        if (shortcut != '') {
            action = this.menu.getAction(shortcut);
        }
        if (action) {
            const idx = this.menu.getActionIndex(action);
            this.menu.selectedIdx = idx;
            setTimeout(() => {
                this.actionItemClicked(action);                
            }, 300);
         }    
    }

    spreekClicked(idx: number) {

    }

    actionItemClicked(item: MenuAction) {
        if (item.action) {
            item.action();
        }
    }

    wisselSpelersClicked() {
        const url = `eigencomps/${this.comp.cmpNaam}/match/${this.idxRonde}/${this.idxTeg}/${this.idxSpl}`;
        this.router.navigateByUrl('/', { skipLocationChange: true })
        .then(() => {
            this.router.navigate([url]);
        });
    }

    naarScorebordClicked() {
        const goto = this.router.url.replace('match', 'score');
        if (this.firstSaveMatch) {
            this.saveMatchAndGoToScorebord(goto);
        }
        else {
            this.router.navigate([goto]);
        }
    }

    startOpnieuwClicked() {
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Wedstrijd opnieuw starten.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('keuze', inhoud);
        this.isOpnieuwDialogOpen = true;
    }

    confirmStartOpnieuwReplied(confirmed: boolean) {
        if (confirmed) {
            const goto = this.router.url.replace('match', 'score');
            this.match.spelers.forEach(spl => {
                spl.stand = new CmpMatchSpelerStand();
                spl.active = false;
            });
            this.match.spelers[0].active = true;
            this.isOpnieuwDialogOpen = false;
            this.saveMatchAndGoToScorebord(goto);    
        }
        else {
            this.isOpnieuwDialogOpen = false;
        }
    }

    uitslagInvoerenClicked() {
        this.matchForm.enable();
        this.tegBrt?.disable();
        if (this.match.regels.idxOptie == 1) {
            this.splBrt?.disable();
            this.splBrt?.setValue(this.match.spelers[0].tsBrt);
            this.tegBrt?.setValue(this.match.spelers[1].tsBrt);
        }
        this.viewMode = false;
        this.checkInvoer();
        this.escapeCount = 1;
        setTimeout(() => {
            this.htmlInputDatum()?.nativeElement.select();            
        }, 250);
    }

    verwijderWedstrijdClicked() {
        const splNaam = this.comp.cmpSpelers[this.idxSpl].splNaam;
        const tegNaam = this.comp.cmpSpelers[this.idxTeg].splNaam;
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([
            `Wedstrijd van ronde ${this.idxRonde + 1} verwijderen:`,
            `${splNaam} - ${tegNaam}`
        ]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmVerwijderenReplied(confirmed: boolean) {
        if (confirmed) {
            const spl = this.comp.cmpSpelers[this.idxSpl];
            const teg = this.comp.cmpSpelers[this.idxTeg];
            const idxSplWed = spl.splRondes[this.idxRonde].wedstrijden.findIndex(wed => wed.tegId == teg.splId);
            const idxTegWed = teg.splRondes[this.idxRonde].wedstrijden.findIndex(wed => wed.tegId == spl.splId);
            if (idxSplWed < 0 || idxTegWed < 0) {
                this.alert.showError(`ERROR : wedstrijd niet gevonden in competitie.`);
                return;
            }
            spl.splRondes[this.idxRonde].wedstrijden.splice(idxSplWed, 1);
            teg.splRondes[this.idxRonde].wedstrijden.splice(idxTegWed, 1);
            const msg = `Wedstrijd ${this.match.spelers[0].bordNaam} - ${this.match.spelers[1].bordNaam} is verwijderd.`;
            this.saveCompAndBackToSchema(msg);
            this.isDialogOpen = false;
        }
        else {
            this.isDialogOpen = false;
            this.menu.selectedIdx = -1;
        }
    }

    scorelijstClicked() {
        const url = this.router.url.replace('match', 'lijst');
        this.router.navigate([url]);
    }

    uitslagOpslaanClicked() {
        this.match.datum = this.datum?.value;
        this.match.spelers[0].stand.aantCar = this.splCar?.value;
        this.match.spelers[1].stand.aantCar = this.tegCar?.value;
        this.match.spelers[0].stand.aantBrt = this.match.spelers[1].stand.aantBrt = this.splBrt?.value;
        this.match.spelers[0].stand.hoogSer = this.splSer?.value;
        this.match.spelers[1].stand.hoogSer = this.tegSer?.value;
        this.match.spelers[0].stand.gemiddelde = this.match.spelers[0].stand.aantCar / this.match.spelers[0].stand.aantBrt;
        this.match.spelers[1].stand.gemiddelde = this.match.spelers[1].stand.aantCar / this.match.spelers[1].stand.aantBrt;
        this.berekenPunten();
        console.log(this.match);
        this.matchToevoegenAanComp();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen || this.isOpnieuwDialogOpen) {
            return true;
        }
        if (event.key === 'Enter' || event.key == 'PageDown') {
            if (this.viewMode) {
                this.actionPressed('');
            }
            else {
                if (this.uitslagOk) {
                    this.buttonPressed(this.enterButton);
                }
            }
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
        if (!this.viewMode) {
            return true;
        }
        // keys below only respond in viewMode
        if (event.key ==='ArrowLeft' || event.key === 'ArrowUp') {
            this.menu.selectPreviousAction();
            return false;
        }    
        if (event.key ==='ArrowRight' || event.key === 'ArrowDown') {
            this.menu.selectNextAction();
            return false;
        }    
        if (event.code === 'Digit1' || event.code === 'Numpad1') {
            this.actionPressed('1');
            return false;
        }
        if (event.code === 'Digit2' || event.code === 'Numpad2') {
            this.actionPressed('2');
            return false;
        }
        if (event.code === 'Digit3' || event.code === 'Numpad3') {
            this.actionPressed('3');
            return false;
        }
        if (event.code === 'Digit4' || event.code === 'Numpad4') {
            this.actionPressed('4');
            return false;
        }
        return true;
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
        Promise.all([
            this.bssApi.getCompetitie(naam),
            this.bssApi.getEigenMatch()
        ])
        .then(results => {
            if (!results[0].gevonden) {
                this.alert.showError(`Competitiebestand '${naam}.json' niet gevonden.`);
                return;
            }
            this.comp = results[0].comp;
            this.title = `Competitie '${this.comp.cmpNaam}'`;
            this.subtitle += ` ronde ${this.idxRonde + 1}`;

            let createdMatch = this.createMatchFromComp();
            if (createdMatch.matchOver) {
                this.match = createdMatch;
            }
            else {
                if (results[1].gevonden) {
                    this.match = results[1].match;
                    if (!this.retrievedMatchEqualsCreatedMatch(createdMatch)) {
                        this.match = createdMatch;
                        this.firstSaveMatch = true;
                    }
                }
                else {
                    this.match = createdMatch;
                    this.firstSaveMatch = true;
                }    
            }
            this.createMatchForm();
            this.setCommentAndMenu();
            if (this.idxComm == 1) { // wedstrijd is gespeeld
                this.comments[1] += ' op ' + this.match.datum;
            }
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private matchToevoegenAanComp() {
        let spl = this.match.spelers[0];
        let teg = this.match.spelers[1];
        let cmpSpl = this.comp.cmpSpelers.find(s => s.splId == spl.id);
        if (!cmpSpl) {
            this.alert.showError(`Speler met id '${spl.id}' niet gevonden in competitie.`);
            return;
        }
        let cmpTeg = this.comp.cmpSpelers.find(s => s.splId == teg.id);
        if (!cmpTeg) {
            this.alert.showError(`Speler met id '${teg.id}' niet gevonden in competitie.`);
            return;
        }
        // speler
        let splWed = new CmpSplWedstrijd();
        splWed.wedOver = true;
        splWed.metWit = true;
        splWed.datum = this.match.datum;
        splWed.tegId = teg.id;
        splWed.tegNaam = teg.naam;
        splWed.aantCar = spl.stand.aantCar;
        splWed.aantBrt = spl.stand.aantBrt;
        splWed.aantPnt = spl.stand.punten;
        splWed.hoogSer = spl.stand.hoogSer;
        this.wedstrijdToevoegen(cmpSpl.splRondes[this.idxRonde], splWed);
        // tegenstander
        let tegWed = new CmpSplWedstrijd();
        tegWed.wedOver = true;
        tegWed.metWit = false;
        tegWed.datum = this.match.datum;
        tegWed.tegId = spl.id;
        tegWed.tegNaam = spl.naam;
        tegWed.aantCar = teg.stand.aantCar;
        tegWed.aantBrt = teg.stand.aantBrt;
        tegWed.aantPnt = teg.stand.punten;
        tegWed.hoogSer = teg.stand.hoogSer;
        this.wedstrijdToevoegen(cmpTeg.splRondes[this.idxRonde], tegWed);
        const msg = `Wedstrijd ${this.match.spelers[0].bordNaam} - ${this.match.spelers[1].bordNaam} is opgeslagen.`;
        this.saveCompAndBackToSchema(msg);
    }

    private wedstrijdToevoegen(ronde: CmpSplRonde, wed: CmpSplWedstrijd) {
        const idx = ronde.wedstrijden.findIndex(w => w.tegId == wed.tegId);
        if (idx < 0) {
            ronde.wedstrijden.push(wed);
        }
        else {
            ronde.wedstrijden[idx] = wed;
        }
        }

    private berekenPunten() {
        const spl = this.match.spelers[0];
        const teg = this.match.spelers[1];
        if (this.match.telling.idxOptie == 0) {
            spl.stand.punten = Math.floor(10 * spl.stand.aantCar / spl.tsCar);
            spl.stand.punten += (spl.stand.gemiddelde > spl.tsMoy) ? 1 : 0;
            teg.stand.punten = Math.floor(10 * teg.stand.aantCar / teg.tsCar);
            teg.stand.punten += (teg.stand.gemiddelde > teg.tsMoy) ? 1 : 0;
        }
    }

    isMatchGespeeld(): boolean {
        let spl = this.comp.cmpSpelers[this.idxSpl];
        let teg = this.comp.cmpSpelers[this.idxTeg];
        return spl.splRondes[this.idxRonde].wedstrijden.some(wed => wed.tegId == teg.splId);
    }

    private createMatchForm() {
        const spl = this.match.spelers[0];
        const teg = this.match.spelers[1];
        this.matchForm = this.fb.nonNullable.group({
            datum: [this.match.datum, [Validators.required, validDateNotFuture()]],
            splCar: [spl.stand.aantCar, [isIntegerNotNegative()]],
            splBrt: [spl.stand.aantBrt, [isIntegerNotNegative()]],
            splSer: [spl.stand.hoogSer, [isIntegerNotNegative()]],
            tegCar: [teg.stand.aantCar, [isIntegerNotNegative()]],
            tegBrt: [teg.stand.aantBrt, [isIntegerNotNegative()]],
            tegSer: [teg.stand.hoogSer, [isIntegerNotNegative()]]
        });
        this.matchForm.get('splCar')?.valueChanges.subscribe(val => {
            this.checkInvoer();
        });
        this.matchForm.get('splBrt')?.valueChanges.subscribe(val => {
            this.checkInvoer();
        });
        this.matchForm.get('splSer')?.valueChanges.subscribe(val => {
            this.checkInvoer();
        });
        this.matchForm.get('tegCar')?.valueChanges.subscribe(val => {
            this.checkInvoer();
        });
        this.matchForm.get('tegSer')?.valueChanges.subscribe(val => {
            this.checkInvoer();
        });
        this.matchForm.get('datum')?.valueChanges.subscribe(val => {
            this.checkInvoer();
        });
        this.matchForm.disable();
    }

    private createMatchFromComp(): CompetitieMatch {
        let result = new CompetitieMatch();
        const spl = this.comp.cmpSpelers[this.idxSpl];
        const teg = this.comp.cmpSpelers[this.idxTeg];
        const splWed = spl.splRondes[this.idxRonde].wedstrijden.find(wed => wed.tegId == teg.splId);
        const tegWed = teg.splRondes[this.idxRonde].wedstrijden.find(wed => wed.tegId == spl.splId);
        result.datum = new Date().toISOString().substring(0, 10);
        result.cmpNaam = this.comp.cmpNaam;
        result.cmpRonde = this.idxRonde + 1;
        result.regels = this.comp.cmpRegels;
        result.telling = this.comp.cmpTelling;
        let matchSpl = new CmpMatchSpeler(spl, true);
        let matchTeg = new CmpMatchSpeler(teg, false);
        if (splWed && tegWed) {
            result.matchOver = true;
            result.datum = splWed.datum;
            // speler stand
            matchSpl.metWit = splWed.metWit;
            matchSpl.stand.aantCar = splWed.aantCar;
            matchSpl.stand.aantBrt = splWed.aantBrt;
            matchSpl.stand.gemiddelde = splWed.aantCar / splWed.aantBrt;
            matchSpl.stand.hoogSer = splWed.hoogSer;
            matchSpl.stand.punten = splWed.aantPnt;
            matchSpl.stand.score = splWed.scores;
            // tegenstander stand
            matchTeg.metWit = tegWed.metWit;
            matchTeg.stand.aantCar = tegWed.aantCar;
            matchTeg.stand.aantBrt = tegWed.aantBrt;
            matchTeg.stand.gemiddelde = tegWed.aantCar / splWed.aantBrt;
            matchTeg.stand.hoogSer = tegWed.hoogSer;
            matchTeg.stand.punten = tegWed.aantPnt;
            matchTeg.stand.score = tegWed.scores;
        }
        else {
            result.matchOver = false;
            result.datum = '';            
        }
        if (matchSpl.metWit) {
            result.spelers.push(matchSpl);
            result.spelers.push(matchTeg);
        }
        else {
            result.spelers.push(matchTeg);
            result.spelers.push(matchSpl);
        }
        return result;
    }

    private setCommentAndMenu() {
        if (this.match.matchOver) {
            this.idxComm = 1;
            if (this.match.spelers[0].stand.score.length > 0) {
                this.menu.addAction(new MenuAction('1', 'Scorelijst', () => { this.scorelijstClicked(); }));
                this.menu.addAction(new MenuAction('2', 'Verwijderen', () => { this.verwijderWedstrijdClicked(); }));
                this.menu.selectedIdx = 0;
            }
            else {
                this.menu.addAction(new MenuAction('1', 'Verwijderen', () => { this.verwijderWedstrijdClicked(); }));
            }
        }
        else {
            if (this.match.spelers[0].stand.aantBrt == 0) {
                this.idxComm = 0;
                this.menu.addAction(new MenuAction('1', 'Start wedstrijd', () => { this.naarScorebordClicked(); }));
                this.menu.addAction(new MenuAction('2', 'Uitslag invoeren', () => { this.uitslagInvoerenClicked(); }));
                this.menu.addAction(new MenuAction('3', 'Wissel spelers', () => { this.wisselSpelersClicked(); }));
                this.menu.selectedIdx = 0;
            }
            else {
                this.idxComm = 2;
                this.menu.addAction(new MenuAction('1', 'Vervolg', () => { this.naarScorebordClicked(); }));
                this.menu.addAction(new MenuAction('2', 'Start opnieuw', () => { this.startOpnieuwClicked(); }));
                this.menu.addAction(new MenuAction('3', 'Uitslag invoeren', () => { this.uitslagInvoerenClicked(); }));
                this.menu.addAction(new MenuAction('4', 'Scorelijst', () => { this.scorelijstClicked(); }));
                this.menu.selectedIdx = 0;
            }
        }
    }

    private checkInvoer() {
        this.uitslagOk = false;
        if (this.match.regels.idxOptie == 1) {  // vast aantal beurten
            this.uitslagOk = true;
            return;
        }
        const sCar = this.splCar?.value | 0;
        const sBrt = this.splBrt?.value | 0;
        const sSer = this.splSer?.value | 0;
        const tCar = this.tegCar?.value | 0;
        const tSer = this.tegSer?.value | 0;
        if (sBrt == 0) {
            return;
        }
        if (this.match.regels.maxBeurten > 0 && sBrt > this.match.regels.maxBeurten) {
            return;
        }
        if (sCar > this.match.spelers[0].tsCar || tCar > this.match.spelers[1].tsCar) {
            return;
        }
        if (sSer > sCar || (sCar > 0 && sSer == 0) || (sSer * sBrt) < sCar) {
            return;
        }
        if (tSer > tCar || (tCar > 0 && tSer == 0) || (tSer * sBrt) < tCar) {
            return;
        }
        this.uitslagOk = true;
    }

    private retrievedMatchEqualsCreatedMatch(createdMatch: CompetitieMatch): boolean {
        if (this.match.cmpNaam != createdMatch.cmpNaam) {
            return false;
        }
        if (this.match.cmpRonde != (createdMatch.cmpRonde)) {
            return false;
        }
        if (this.match.spelers[0].id != createdMatch.spelers[0].id) {
            return false;
        }
        if (this.match.spelers[1].id != createdMatch.spelers[1].id) {
            return false;
        }
        if (this.match.matchOver && !createdMatch.matchOver) {
            return false;
        }
        return true;
    }

    private saveMatchAndGoToScorebord(url: string) {
        this.bssApi.saveEigenMatch(this.match)
        .then(resp => {
            this.router.navigate([url]);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private saveCompAndBackToSchema(successMsg: string) {
        this.bssApi.saveCompetitie(this.comp)
        .then(resp => {
            this.alert.showAlert(successMsg, 'success');
            this.router.navigate([`eigencomps/${this.comp.cmpNaam}/schema/${this.idxRonde}`]);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    get maxBrt() {
        return this.matchForm.get('maxBrt');
    }
    get splCar() {
        return this.matchForm.get('splCar');
    }
    get splBrt() {
        return this.matchForm.get('splBrt');
    }
    get splSer() {
        return this.matchForm.get('splSer');
    }
    get tegCar() {
        return this.matchForm.get('tegCar');
    }
    get tegBrt() {
        return this.matchForm.get('tegBrt');
    }
    get tegSer() {
        return this.matchForm.get('tegSer');
    }
    get datum() {
        return this.matchForm.get('datum');
    }

}
