import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CmpSpeler, Competitie, CompLeesResultaat } from '../../../model/competitie';
import { BaseComponent } from '../../../base/base.component';
import { VerenigingKort } from '../../../model/vereniging';
import { List } from '../../../model/list';
import { SpelerWrapper } from '../../../model/speler';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgClass } from '@angular/common';
import { MoyenneTabel } from '../../../model/moyenne-tabel';
import { Alinea, ConfirmDialog, ConfirmSplBordNaamDialog } from '../../../model/dialogs';
import { ConfirmComponent } from '../../../shared/confirm/confirm.component';
import { ConfirmBordnaamComponent } from '../../../shared/confirm-bordnaam/confirm-bordnaam.component';

@Component({
    selector: 'app-comp-spelers',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        ConfirmComponent,
        ConfirmBordnaamComponent,
        FormsModule,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './comp-spelers.component.html',
    styleUrl: './comp-spelers.component.css'
})
export class CompSpelersComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Eigen competitie';
    competitie: Competitie = new Competitie('');
    verenigingen: VerenigingKort[] = [];
    verFilter: string = '';
    spelerLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    moyenneTabel: MoyenneTabel = new MoyenneTabel();
    idxSpelerToRemove: number = 0;
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);
    bordNaamDialog!: ConfirmSplBordNaamDialog;
    isBordNaamDialogOpen: boolean = false;

    spelerClicked(idx: number) {
        const spelerToAdd = this.spelerLijst.filtered[idx];
        let duplicate = this.competitie.cmpSpelers.some(spl => spl.splId == spelerToAdd.speler.id);
        if (duplicate) {
            this.alert.showAlert(`Speler ${spelerToAdd.getNaam()} zit al in de competitie.`, 'info');
            return;
        }
        duplicate = this.competitie.cmpSpelers.some(spl => spl.splBordnaam == spelerToAdd.speler.bordnaam);
        if (duplicate) {
            this.confirmSpelerToevoegen(spelerToAdd);
            return;
        }
        this.spelerToevoegen(spelerToAdd);
    }

    private confirmSpelerToevoegen(spelerToAdd: SpelerWrapper) {
        let existing = this.competitie.cmpSpelers.map(spl => spl.splBordnaam);
        this.bordNaamDialog = new ConfirmSplBordNaamDialog(spelerToAdd, existing);
        this.isBordNaamDialogOpen = true;
    }

    confirmSpelerToevoegenReplied(accept: boolean) {
        if (accept) {
            this.spelerToevoegen(this.bordNaamDialog.speler, this.bordNaamDialog.naam);
        }
        this.isBordNaamDialogOpen = false;
    }

    private spelerToevoegen(spelerToAdd: SpelerWrapper, bordNaam?: string) {
        let addedSpeler: CmpSpeler = new CmpSpeler(this.competitie.cmpAantRondes);
        addedSpeler.splId = spelerToAdd.speler.id;
        addedSpeler.splNaam = spelerToAdd.getNaam();
        addedSpeler.splInit = this.getSpelerInitialen(addedSpeler.splNaam);
        addedSpeler.splBordnaam = bordNaam ? bordNaam : spelerToAdd.speler.vnaam;
        addedSpeler.splSpreeknaam = spelerToAdd.speler.vnaam;
        addedSpeler.splMoyenne = spelerToAdd.getGemiddeldeVanSpel();
        this.fillTeSpelenCarsEnBeurten(addedSpeler);
        this.competitie.cmpSpelers.push(addedSpeler);
        this.competitie.cmpSpelers.sort(this.compareCompSpelers);
        this.bssApi.saveCompetitie(this.competitie)
        .then(resp => {
            this.alert.showAlert(`Speler ${addedSpeler.splNaam} is toegevoegd aan de competitie`, 'success');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    compSpelerClicked(idx: number) {
        this.idxSpelerToRemove = idx;
        const spelerToRemove = this.competitie.cmpSpelers[this.idxSpelerToRemove];
        if (this.getAantGespeeldeWedstrijden(spelerToRemove) == 0) {
            this.verwijderSpelerUitCompetitie(idx);
        }
        else {
            let inhoud: Alinea[] = [];
            inhoud.push(new Alinea([
                `Verwijder ${spelerToRemove.splNaam} uit de competitie.`,
                `Deze speler heeft al wedstrijden gespeeld.`,
                `Die uitslagen gaan ook verloren.`
            ]));
            inhoud.push(new Alinea([`Weet u het zeker?`]));
            this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
            this.isDialogOpen = true;
        }
    }

    confirmReplied(confirmed: boolean) {
        if (!confirmed) {
            this.isDialogOpen = false;
            return;
        }
        const spelerToRemove = this.competitie.cmpSpelers[this.idxSpelerToRemove];
        spelerToRemove.splRondes.forEach((ronde, idxR) => {
            ronde.wedstrijden.forEach(splWed => {
                this.removeTegenstanderWedstrijd(idxR, spelerToRemove.splId, splWed.tegId);
            });
        });
        this.verwijderSpelerUitCompetitie(this.idxSpelerToRemove);
    }

    verFilterChanged() {
        if (this.verFilter == '') {
            this.spelerLijst.filter((item: SpelerWrapper) => {
                return true;
            });
        }
        else {
            this.spelerLijst.filter((item: SpelerWrapper) => {
                let verenigingOk = false;
                if (this.verFilter == '0') {
                    verenigingOk = !item.speler.verenigingIds.length;
                }
                else {
                    verenigingOk = item.speler.verenigingIds.some(id => id == this.verFilter);
                }
                return verenigingOk;
            });
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen || this.isBordNaamDialogOpen) {
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
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
        Promise.all([
            this.bssApi.getCompetitie(naam),
            this.bssApi.getVerenigingenKort(),
            this.bssApi.getSpelersLijst(this.spelId)
        ])
        .then(results => {
            if (results[0].gevonden) {
                this.competitie = results[0].comp;
            }
            else {
                this.alert.showError(`Competitiebestand '${naam}.json' niet gevonden.`);
                return;
            }
            if (this.competitie.cmpRegels.idxOptie == 0) {
                this.bssApi.getMoyenneTabel(this.spelId + '-' + this.competitie.cmpRegels.knbbKlasse)
                .then(data => {
                    this.moyenneTabel = data;
                    this.initializeComponent(results);
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.initializeComponent(results);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private initializeComponent(results: [CompLeesResultaat, VerenigingKort[], SpelerWrapper[]]) {
        this.subtitle = this.subtitle + ` '${this.competitie.cmpNaam}' - spelers`;
        this.verenigingen = results[1];
        this.verenigingen.sort(this.compareVerenigingen);
        this.spelerLijst.fillItems(results[2].sort(this.compareSpelersNaam));
        const verId = this.appData.getConfig()?.vereniging;
        if (verId) {
            this.verFilter = verId;
            this.verFilterChanged();
        }
    }

    private verwijderSpelerUitCompetitie(idx: number) {
        const naam =  this.competitie.cmpSpelers[idx].splNaam;
        this.competitie.cmpSpelers.splice(idx, 1);
        this.bssApi.saveCompetitie(this.competitie)
        .then(resp => {
            this.alert.showAlert(`Speler ${naam} is verwijderd uit de competitie`, 'success');
            this.isDialogOpen = false;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    getAantGespeeldeWedstrijden(spl: CmpSpeler): number {
        let result = 0;
        spl.splRondes.forEach(ronde => {
            result += ronde.wedstrijden.length;
        });
        return result;
    }

    private removeTegenstanderWedstrijd(idxRonde: number, splId: string, tegId: string) {
        let tegenstander = this.competitie.cmpSpelers.find(spl => spl.splId == tegId);
        if (tegenstander) {
            let idxWed = tegenstander.splRondes[idxRonde].wedstrijden.findIndex(wed => wed.tegId == splId);
            if (idxWed >= 0) {
                tegenstander.splRondes[idxRonde].wedstrijden.splice(idxWed, 1);
            }
        }
    }

    private fillTeSpelenCarsEnBeurten(spl: CmpSpeler) {
        if (this.competitie.cmpRegels.idxOptie == 0) {
            spl.splTeSpelenCar = this.getAantalCarsFromTabel(spl.splMoyenne);
        }
        else if (this.competitie.cmpRegels.idxOptie == 1) {
            spl.splTeSpelenBrt = this.competitie.cmpRegels.vastAantBrt;
            spl.splTeSpelenCar = Math.ceil(spl.splMoyenne * spl.splTeSpelenBrt);
        }
        else if (this.competitie.cmpRegels.idxOptie == 2) {
            spl.splTeSpelenCar = this.competitie.cmpRegels.vastAantCar;
        }
        else if (this.competitie.cmpRegels.idxOptie == 3) {
            spl.splTeSpelenCar = Math.round(spl.splMoyenne * this.competitie.cmpRegels.moyAantBrt);
        }
    }

    private getAantalCarsFromTabel(moy: number): number {
        let result = this.moyenneTabel.minimum;
        this.moyenneTabel.moyennes.every(entry => {
            if (moy >= entry.vanaf) {
                result = entry.cars;
                return true;
            }
            return false;
        });
        return result;
    }

    private getSpelerInitialen(naam: string) {
        let result = '';
        if (!naam || naam == '') {
            return result;
        }
        const arr = naam.split(' ');
        arr.forEach((part: string) => {
            result += part.charAt(0);
        });
        return result;
    }

    private compareVerenigingen(a: VerenigingKort, b: VerenigingKort): number {
        return a.naam > b.naam ? 1 : -1;
    }

    private compareSpelersNaam(a: SpelerWrapper, b: SpelerWrapper): number {
        return (a.getNaam() > b.getNaam()) ? 1 : -1;
    }

    private compareCompSpelers(a: CmpSpeler, b: CmpSpeler): number {
        return (a.splNaam > b.splNaam) ? 1 : -1;
    }

}
