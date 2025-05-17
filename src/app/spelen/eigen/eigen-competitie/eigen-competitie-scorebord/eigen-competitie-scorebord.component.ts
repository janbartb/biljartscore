import { Component, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { CmpSplWedstrijd, Competitie, CompetitieMatch } from '../../../../model/competitie';
import { HelperService } from '../../../../services/helper.service';
import { ConfirmEndOfMatchDialog } from '../../../../model/dialogs';
import { Wedstrijd } from '../../../../model/wedstrijd';
import { ScoreService } from '../../../../services/score.service';
import { ScoreComponent } from '../../../../shared/score/score.component';
import { ConfirmEndOfMatchComponent } from '../../../../shared/confirm-end-of-match/confirm-end-of-match.component';

@Component({
    selector: 'app-eigen-competitie-scorebord',
    standalone: true,
    imports: [
        ScoreComponent,
        ConfirmEndOfMatchComponent
    ],
    templateUrl: './eigen-competitie-scorebord.component.html',
    styleUrl: './eigen-competitie-scorebord.component.css'
})
export class EigenCompetitieScorebordComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);
    scoreService = inject(ScoreService);

    comp: Competitie = new Competitie('');
    match: CompetitieMatch = new CompetitieMatch();
    wedstrijd: Wedstrijd = new Wedstrijd();
    idxSpl: number = -1;
    idxTeg: number = -1;
    idxRonde: number = -1;
    endOfMatchDialog: ConfirmEndOfMatchDialog = new ConfirmEndOfMatchDialog();
    isEndOfMatchDialogOpen: boolean = false;
    wedReady: boolean = false;

    override escapePressed(): void {
        if (this.match.matchOver && !this.match.opgeslagen) {
            this.isEndOfMatchDialogOpen = true;
            return;
        }
        this.appData.previousPage();
    }

    handleKey(key: string) {
        if (key == 'Escape') {
            this.escapePressed();
        }
        else if (key == 'Lijst') {
            const toUrl = this.router.url.replace('score', 'lijst');
            this.appData.gotoPage(this.router.url, toUrl);
        }
        else if (key == 'Ready') {
            this.isEndOfMatchDialogOpen = true;
        }
    }

    updateAndSaveMatch(wed: Wedstrijd) {
        this.scoreService.updateCompMatchFromWedstrijd(this.match, wed);
        this.saveMatch();
    }

    endOfMatchDialogReplied(accepted: boolean) {
        if (accepted) {
            this.matchToevoegenAanComp(this.wedstrijd);
        }
        this.isEndOfMatchDialogOpen = false;
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
                this.appData.previousPage();
                return;
            }
            if (!results[1].gevonden) {
                this.alert.showError('ERROR scorebord : bestand eigenmatch.json niet gevonden.');
                this.appData.previousPage();
                return;
            }
            this.comp = results[0].comp;
            this.match = results[1].match;
            if (this.matchAanwezigInComp()) {
                this.appData.previousPage();
                return;
            }
            this.wedstrijd = this.scoreService.createWedFromCompMatch(this.match);
            // this.maxBeurten = (this.match.regels.maxBeurten > 0) ? this.match.regels.maxBeurten : 100;
            // if (this.match.matchOver) {
            //     this.oldPunten[0] = this.match.spelers[0].stand.punten;
            //     this.oldPunten[1] = this.match.spelers[1].stand.punten;
            //     const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE WEDSTRIJD ▪ ▪ ▪ ▪'], '', 3);
            //     this.modals.push(modalMsg);
            //     this.showModal();
            // }
            // else {
            //     this.idxSpeler = this.getIndexActieveSpeler(this.match);
            //     this.activeSpeler = this.match.spelers[this.idxSpeler];
            //     this.activeSpeler.active = true;
            //     this.verhoogBeurtenEnBerekenData(this.activeSpeler);
            //     this.oldPunten[0] = this.match.spelers[0].stand.punten;
            //     this.oldPunten[1] = this.match.spelers[1].stand.punten;
            //     this.checkForSpelerMessages();
            // }
            this.wedReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        })        
    }

    private matchAanwezigInComp(): boolean {
        const cmpSpl = this.comp.cmpSpelers[this.idxSpl];
        const teg = this.match.spelers[1];
        return cmpSpl.splRondes[this.idxRonde].wedstrijden.some(wed => wed.tegId == teg.id);
    }

    private matchToevoegenAanComp(wed: Wedstrijd) {
        this.scoreService.updateCompMatchFromWedstrijd(this.match, wed);
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
            this.wedstrijd.wedOpgeslagen = true;
            this.saveMatch();
            this.isEndOfMatchDialogOpen = false;
            this.alert.showAlert(`Uitslag ${this.match.spelers[0].bordNaam} - ${this.match.spelers[1].bordNaam} opgeslagen in competitie.`, 'success');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private saveMatch() {
        this.bssApi.saveEigenMatch(this.match)
        .then(() => {})
        .catch(err => {
            this.alert.showError(err);
        });
    }

}
