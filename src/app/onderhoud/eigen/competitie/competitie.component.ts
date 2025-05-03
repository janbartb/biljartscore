import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { CmpSplRonde, Competitie, CompNaamDelen } from '../../../model/competitie';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { Button } from '../../../model/button';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { notEmpty } from '../../../directives/validators.directive';
import { NgClass } from '@angular/common';
import { Spelsoort } from '../../../model/spelsoort';
import { Alinea, ConfirmDialog } from '../../../model/dialogs';
import { ConfirmComponent } from '../../../shared/confirm/confirm.component';

@Component({
    selector: 'app-competitie',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ConfirmComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './competitie.component.html',
    styleUrl: './competitie.component.css'
})
export class CompetitieComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);
    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Eigen competitie';
    competitie: Competitie = new Competitie('');
    competitieOk: boolean = false;
    compNaamOk: boolean = false;
    regelOpties: string[] = [];
    telOpties: string[] = [];
    existingNames: string[] = [];
    spelsoorten: Spelsoort[] = [];
    spelsoortNaam: string = '';
    knbbKlassen: string[] = [];
    aantWedGespeeld: number[] = []; // aant gespeelde wedstrijden per ronde
    mode: string = 'view';
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    buttons: Button[] = [
        new Button('S', 'Spelers', true),
        new Button('+', 'Ronde', true),
        new Button('-', 'Ronde', true),
        new Button('Enter', 'Opslaan', true)
    ];

    compForm!: FormGroup;

    htmlInputType = viewChild<ElementRef<HTMLInputElement>>("cmptype");

    constructor() {
        super();
        effect(() => {
            this.htmlInputType()?.nativeElement.select();
        });
    }

    buttonPressed(button: Button) {
        if (button.key == 'Enter') { 
            if (!this.compForm || !this.compForm.valid || !this.compNaamOk) {
                return;
            }
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.buttonClicked(3);
            }
            else if (button.key == 'S') {
                this.buttonClicked(0);
            }
            else if (button.key == '+') {
                this.buttonClicked(1);
            }
            else if (button.key == '-') {
                this.buttonClicked(2);
            }
        }, 300);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.spelersClicked();
        }
        else if (idx == 1) {
            this.rondeToevoegenClicked();
        }
        else if (idx == 2) {
            this.rondeVerwijderenClicked();
        }
        else if (idx == 3) {
            this.opslaanClicked();
        }
    }

    spelersClicked() {
        this.appData.gotoPage(this.router.url, this.router.url + '/spelers');
    }

    rondeToevoegenClicked() {
        this.confirmRondeToevoegen();
    }

    private confirmRondeToevoegen() {
        const rondeNr = this.competitie.cmpAantRondes + 1;
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Ronde ${rondeNr} toevoegen aan competitie '${this.competitie.cmpNaam}'.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('toevoegen', inhoud);
        this.isDialogOpen = true;
    }

    rondeVerwijderenClicked() {
        this.confirmRondeVerwijderen();
    }

    private confirmRondeVerwijderen() {
        const rondeNr = this.competitie.cmpAantRondes;
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([
            `Ronde ${rondeNr} verwijderen uit competitie '${this.competitie.cmpNaam}'.`,
            `Wedstrijdresultaten van deze ronde worden ook verwijderd.`,
            `Dit is onomkeerbaar.`
        ]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        if (!confirmed) {
            this.isDialogOpen = false;
            return;
        }
        if (this.confirmDialog.actie == 'verwijderen') {
            this.rondeVerwijderen();
        }
        else {
            this.rondeToevoegen();
        }
    }

    private rondeToevoegen() {
        this.competitie.cmpAantRondes++;
        this.cmpAantRondes?.setValue(this.competitie.cmpAantRondes);
        this.competitie.cmpSpelers.forEach(spl => {
            spl.splRondes.push(new CmpSplRonde(this.competitie.cmpAantRondes));
        });
        this.fillAantGespeeldeWedstrijden();
        this.bssApi.saveCompetitie(this.competitie)
        .then(resp => {
            this.alert.showAlert(`Ronde ${this.competitie.cmpAantRondes} is toegevoegd`, 'success');
            this.isDialogOpen = false;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private rondeVerwijderen() {
        const ronde = this.competitie.cmpAantRondes;
        this.competitie.cmpAantRondes--;
        this.cmpAantRondes?.setValue(this.competitie.cmpAantRondes);
        this.competitie.cmpSpelers.forEach(spl => {
            spl.splRondes.pop();
        });
        this.fillAantGespeeldeWedstrijden();
        this.bssApi.saveCompetitie(this.competitie)
        .then(resp => {
            this.alert.showAlert(`Ronde ${ronde} is verwijderd`, 'success');
            this.isDialogOpen = false;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    opslaanClicked() {
        const comp = this.getCompetitieFromForm();
        Promise.all([
            this.bssApi.saveCompetitie(comp),
        ])
        .then(results => {
            this.router.navigate([`onderhoud/eigencomp/${comp.cmpNaam}`]);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    regelOptieClicked(idx: number) {
        if (this.mode == 'view') {
            return;
        }
        this.cmpIdxRegels?.setValue(idx);
        if (idx == 0) {
            this.cmpMaxBrt?.setValue(60);
        }
        else if (idx == 1) {
            this.cmpMaxBrt?.setValue(0);
        }
        this.enableDisableFields();
    }

    telOptieClicked(idx: number) {
        if (this.mode == 'view') {
            return;
        }
        this.cmpIdxTelling?.setValue(idx);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return false;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(this.buttons[3]);
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (this.mode == 'view') {
            if (event.code === 'KeyS') {
                this.buttonPressed(this.buttons[0]);
                return false;
            }
            if (event.code === 'Equal') {
                this.buttonPressed(this.buttons[1]);
                return false;
            }
            if (event.code === 'Minus') {
                if (this.competitie.cmpAantRondes > 1) {
                    this.buttonPressed(this.buttons[2]);
                }
                return false;
            }    
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }    
        return true;
    }

    ngOnInit(): void {
        let naam: string | null = null;
        if (this.router.url.indexOf('toevoegen') >= 0) {
            naam = 'toevoegen';
        }
        else {
            naam = this.route.snapshot.paramMap.get('naam');
            if (!naam) {
                this.alert.showAlert('De naam in de URL is niet geldig.', 'error');
                return;
            }
        }
        if (naam == 'toevoegen') {
            this.mode = 'add';
            this.subtitle = 'Eigen competitie toevoegen';
            Promise.all([
                this.bssApi.getCompetitieList(this.spelId),
                this.bssApi.getMoyenneKlassenLijst(this.spelId),
                this.bssApi.getSpelsoorten()
            ])
            .then(results => {
                this.existingNames = results[0];
                this.knbbKlassen = results[1];
                this.spelsoorten = results[2];
                this.competitie = this.initCompetitie();
                this.createCompetitieForm();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            Promise.all([
                this.bssApi.getCompetitie(naam),
                this.bssApi.getMoyenneKlassenLijst(this.spelId),
                this.bssApi.getSpelsoorten()
            ])
            .then(results => {
                if (results[0].gevonden) {
                    this.competitie = results[0].comp;
                }
                else {
                    this.alert.showError(`Competitiebestand '${naam}.json' niet gevonden.`);
                    return;
                }
                this.fillAantGespeeldeWedstrijden();
                this.compNaamOk = true;
                this.subtitle = this.subtitle + ` '${this.competitie.cmpNaam}'`;
                this.knbbKlassen = results[1];
                this.spelsoorten = results[2];
                this.getSpelsoortNaam();
                this.createCompetitieForm();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        this.regelOpties.push('Aantal caramboles o.b.v. KNBB tabel driebanden klein, klasse');
        this.regelOpties.push('Vast aantal beurten voor iedere speler');
        this.regelOpties.push('Vast aantal caramboles voor iedere speler');
        this.regelOpties.push('Aantal caramboles o.b.v. moyenne speler en');

        this.telOpties.push('KNBB match telling (1 punt per 10% van te spelen caramboles)');
        this.telOpties.push('Eigen telling');
    }

    initCompetitie(): Competitie {
        const naam = '<type>-' + this.spelId + '-' + new Date().getFullYear() + '-1';
        let result = new Competitie(naam);
        result.cmpAantRondes = 1;
        result.cmpRegels.vastAantBrt = 1;
        result.cmpRegels.vastAantCar = 1;
        result.cmpRegels.moyAantBrt = 1;
        const foundKlasse = this.knbbKlassen.find(klasse => klasse == 'B2');
        if (foundKlasse) {
            result.cmpRegels.knbbKlasse = foundKlasse;
            result.cmpRegels.maxBeurten = 60;
        }
        result.cmpTelling.winstPunten = 2;
        result.cmpTelling.gelijkPunten = 1;
        result.cmpTelling.bovenMoyPunten = 1;
        result.cmpRegels.idxOptie = 0;
        result.cmpTelling.idxOptie = 0;
        return result;
    }

    private processCompNaam() {
        this.competitieOk = false;
        this.compNaamOk = false;
        const type = this.cmpType?.value ? this.cmpType.value : '<type>';
        const spel = this.cmpSpelId?.value ? this.cmpSpelId.value : '<spel>';
        const jaar = this.cmpJaar?.value ? this.cmpJaar.value : '<jaar>';
        const volg = this.cmpVolgNr?.value ? this.cmpVolgNr.value : '<nr>'
        const naam = type + '-' + spel + '-' + jaar + '-' + volg;
        this.competitie.cmpNaam = naam;
        this.competitie.cmpNaamDelen = new CompNaamDelen(naam);
        if (this.competitie.cmpNaam.indexOf('<') >= 0) {
            return;
        }
        const duplicate = this.existingNames.some(name => name == this.competitie.cmpNaam);
        if (duplicate) {
            return;
        }
        this.compNaamOk = true;
        //this.checkCompetitie();
    }

    private getSpelsoortNaam() {
        this.spelsoortNaam = '';
        const found = this.spelsoorten.find(srt => srt.spelsoortId == this.competitie.cmpNaamDelen.cmpSpelId);
        if (found) {
            this.spelsoortNaam = found.spelsoortNaam;
        }
    }

    private fillAantGespeeldeWedstrijden() {
        this.aantWedGespeeld = [];
        for (let i = 0; i < this.competitie.cmpAantRondes; i++) {
            let aantWed = 0;
            this.competitie.cmpSpelers.forEach(spl => {
                aantWed += spl.splRondes[i].wedstrijden.length;
            });
            aantWed = aantWed / 2;
            this.aantWedGespeeld.push(aantWed);
        }
    }

    private enableDisableFields() {
        if (!this.compForm) {
            return;
        }
        if (this.cmpIdxRegels?.value == 0) {
            this.cmpKlasse?.enable();
            this.cmpAantBrt?.disable();
            this.cmpAantCar?.disable();
            this.cmpMoyBrt?.disable();
            }
        else if (this.cmpIdxRegels?.value == 1) {
            this.cmpKlasse?.disable();
            this.cmpAantBrt?.enable();
            this.cmpAantCar?.disable();
            this.cmpMoyBrt?.disable();
            }
        else if (this.cmpIdxRegels?.value == 2) {
            this.cmpKlasse?.disable();
            this.cmpAantBrt?.disable();
            this.cmpAantCar?.enable();
            this.cmpMoyBrt?.disable();
            }
        else if (this.cmpIdxRegels?.value == 3) {
            this.cmpKlasse?.disable();
            this.cmpAantBrt?.disable();
            this.cmpAantCar?.disable();
            this.cmpMoyBrt?.enable();
        }
    }

    // private checkCompetitie() {
    //     this.competitieOk = false;
    //     if (!this.compForm || !this.compForm.valid || !this.compNaamOk) {
    //         return;
    //     }
    //     this.competitieOk = true;
    // }

    private getCompetitieFromForm(): Competitie {
        const naam = this.cmpType?.value + '-' + this.cmpSpelId?.value + '-' + this.cmpJaar?.value + '-' + this.cmpVolgNr?.value;
        let result = new Competitie(naam);
        result.cmpAantRondes = this.cmpAantRondes?.value;
        result.cmpRegels.idxOptie = this.cmpIdxRegels?.value;
        if (result.cmpRegels.idxOptie == 0) {
            result.cmpRegels.knbbKlasse = this.cmpKlasse?.value;
            result.cmpRegels.maxBeurten = this.cmpMaxBrt?.value;
        }
        else if (result.cmpRegels.idxOptie == 1) {
            result.cmpRegels.vastAantBrt = this.cmpAantBrt?.value;
            result.cmpRegels.maxBeurten = result.cmpRegels.vastAantBrt;            
        }
        else if (result.cmpRegels.idxOptie == 2) {
            result.cmpRegels.vastAantCar = this.cmpAantCar?.value;
            result.cmpRegels.maxBeurten = this.cmpMaxBrt?.value;            
        }
        else if (result.cmpRegels.idxOptie == 3) {
            result.cmpRegels.moyAantBrt = this.cmpMoyBrt?.value;
            result.cmpRegels.maxBeurten = this.cmpMaxBrt?.value;            
        }
        result.cmpTelling.idxOptie = this.cmpIdxTelling?.value;
        if (result.cmpTelling.idxOptie == 1) {
            result.cmpTelling.winstPunten = this.cmpPntWinst?.value;
            result.cmpTelling.gelijkPunten = this.cmpPntGelijk?.value;
        }
        result.cmpTelling.bovenMoyPunten = this.cmpPntBovenMoy?.value;
        return result;
    }

    private createCompetitieForm() {
        this.compForm = this.fb.nonNullable.group({
            cmpType: [this.competitie.cmpNaamDelen.cmpType, [Validators.required, notEmpty()]],
            cmpSpelId: [this.competitie.cmpNaamDelen.cmpSpelId, [Validators.required, notEmpty()]],
            cmpJaar: [this.competitie.cmpNaamDelen.cmpJaar, [Validators.required, Validators.min(2020)]],
            cmpVolgNr: [this.competitie.cmpNaamDelen.cmpVolgNr, [Validators.required, Validators.min(1)]],
            cmpAantRondes: [this.competitie.cmpAantRondes, [Validators.required, Validators.min(1)]],
            cmpKlasse: [this.competitie.cmpRegels.knbbKlasse],
            cmpAantBrt: [this.competitie.cmpRegels.vastAantBrt, [Validators.required, Validators.min(1)]],
            cmpAantCar: [this.competitie.cmpRegels.vastAantCar, [Validators.required, Validators.min(1)]],
            cmpMaxBrt: [this.competitie.cmpRegels.maxBeurten, [Validators.required, Validators.min(0)]],
            cmpMoyBrt: [this.competitie.cmpRegels.moyAantBrt, [Validators.required, Validators.min(1)]],
            cmpPntWinst: [this.competitie.cmpTelling.winstPunten, [Validators.required, Validators.min(0)]],
            cmpPntGelijk: [this.competitie.cmpTelling.gelijkPunten, [Validators.required, Validators.min(0)]],
            cmpPntBovenMoy: [this.competitie.cmpTelling.bovenMoyPunten, [Validators.required, Validators.min(0)]],
            cmpIdxRegels: [this.competitie.cmpRegels.idxOptie],
            cmpIdxTelling: [this.competitie.cmpTelling.idxOptie]
        });
        if (this.mode == 'add') {
            this.compForm.get('cmpType')?.valueChanges.subscribe(val => {
                this.processCompNaam();
            });
            this.compForm.get('cmpJaar')?.valueChanges.subscribe(val => {
                this.processCompNaam();
            });
            this.compForm.get('cmpVolgNr')?.valueChanges.subscribe(val => {
                this.processCompNaam();
            });
            this.enableDisableFields();
        }
        else {
            this.compForm.disable();
        }
    }

    get cmpType() {
        return this.compForm.get('cmpType');
    }
    get cmpJaar() {
        return this.compForm.get('cmpJaar');
    }
    get cmpVolgNr() {
        return this.compForm.get('cmpVolgNr');
    }
    get cmpSpelId() {
        return this.compForm.get('cmpSpelId');
    }
    get cmpAantRondes() {
        return this.compForm.get('cmpAantRondes');
    }
    get cmpAantBrt() {
        return this.compForm.get('cmpAantBrt');
    }
    get cmpAantCar() {
        return this.compForm.get('cmpAantCar');
    }
    get cmpMaxBrt() {
        return this.compForm.get('cmpMaxBrt');
    }
    get cmpMoyBrt() {
        return this.compForm.get('cmpMoyBrt');
    }
    get cmpKlasse() {
        return this.compForm.get('cmpKlasse');
    }
    get cmpPntWinst() {
        return this.compForm.get('cmpPntWinst');
    }
    get cmpPntGelijk() {
        return this.compForm.get('cmpPntGelijk');
    }
    get cmpPntBovenMoy() {
        return this.compForm.get('cmpPntBovenMoy');
    }
    get cmpIdxRegels() {
        return this.compForm.get('cmpIdxRegels');
    }
    get cmpIdxTelling() {
        return this.compForm.get('cmpIdxTelling');
    }
}
