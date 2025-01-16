import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { KnbbCompetitie } from '../../../model/knbb-competitie';
import { District } from '../../../model/district';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { Button } from '../../../model/button';
import { notEmpty } from '../../../directives/validators.directive';
import { Spelsoort } from '../../../model/spelsoort';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-knbb-competitie-add',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './knbb-competitie-add.component.html',
    styleUrl: './knbb-competitie-add.component.css'
})
export class KnbbCompetitieAddComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    subtitle: string = '';
    sectionTitle: string = 'Competitie toevoegen';
    competitie: KnbbCompetitie = new KnbbCompetitie();
    klassen: string[] = [];
    districten: District[] = [];
    spelsoorten: Spelsoort[] = [];
    existing: string[] = [];

    buttons: Button[] = [new Button('Enter', 'Opslaan', true)];

    htmlInputKnbbId = viewChild<ElementRef<HTMLInputElement>>("knbbid");

    competitieForm!: FormGroup;
    duplicateId: boolean = false;

    constructor() {
        super();
        effect(() => {
            this.htmlInputKnbbId()?.nativeElement.focus();
        });
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.enterClicked();
            }
        }, 300);
    }

    enterClicked() {
        if (!this.duplicateId && this.competitieForm && this.competitieForm.valid) {
            this.toevoegenCompetitie();
        }
    }

    toevoegenCompetitie() {
        this.naam?.setValue(this.naam.value.trim());
        Object.assign(this.competitie, this.competitieForm.value);
        this.bssApi.addKnbbCompetitie(this.competitie)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.escapePressed();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.buttons[0]);
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
        return true;
    }

    ngOnInit(): void {
        this.competitie.seizoen = this.appData.getSeizoen();
        this.competitie.district = this.appData.getDistrict().disId;
        this.competitie.spelsoort = this.spelId;
        this.competitie.volgNr = 1;
        this.competitie.poule = 1;
        this.competitie.competitieId = '-' + this.competitie.volgNr + '-' + this.competitie.poule;
        this.subtitle = 'KNBB competities ' + this.competitie.seizoen;

        Promise.all([
            this.bssApi.getExistingKnbbCompetitieIds(this.competitie.district, this.competitie.spelsoort),
            this.bssApi.getMoyenneKlassenLijst(this.spelId),
            this.bssApi.getKnbbDistricten(),
            this.bssApi.getSpelsoorten()
        ])
        .then(results => {
            this.existing = results[0];
            this.klassen = results[1];
            this.districten = results[2];
            this.spelsoorten = results[3];
            this.createCompetitieForm();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private createCompetitieId() {
        this.competitieId?.setValue(this.klasse?.value + '-' + this.volgNr?.value + '-' + this.poule?.value);
    }

    private createCompetitieForm() {
        this.competitieForm = this.fb.nonNullable.group({
            competitieId: [this.competitie.competitieId],
            seizoen: [this.competitie.seizoen],
            district: [this.competitie.district],
            spelsoort: [this.competitie.spelsoort],
            knbbId: [this.competitie.knbbId],
            klasse: [this.competitie.klasse, [Validators.required]],
            volgNr: [this.competitie.volgNr, [Validators.required, Validators.min(1)]],
            poule: [this.competitie.poule, [Validators.required, Validators.min(1)]],
            naam: [this.competitie.naam, [Validators.required, notEmpty()]],
            maxBeurten: [this.competitie.maxBeurten, [Validators.required, Validators.min(1)]]
        });
        this.seizoen?.disable();
        this.district?.disable();
        this.spelsoort?.disable();
        this.competitieId?.valueChanges.subscribe(val => {
            this.duplicateId = this.existing.some(id => id == val);
        });
        this.klasse?.valueChanges.subscribe(val => {
            this.createCompetitieId();
        });
        this.volgNr?.valueChanges.subscribe(val => {
            this.createCompetitieId();
        });
        this.poule?.valueChanges.subscribe(val => {
            this.createCompetitieId();
        });
    }

    get competitieId() {
        return this.competitieForm.get('competitieId');
    }
    get seizoen() {
        return this.competitieForm.get('seizoen');
    }
    get district() {
        return this.competitieForm.get('district');
    }
    get spelsoort() {
        return this.competitieForm.get('spelsoort');
    }
    get knbbId() {
        return this.competitieForm.get('knbbId');
    }
    get klasse() {
        return this.competitieForm.get('klasse');
    }
    get volgNr() {
        return this.competitieForm.get('volgNr');
    }
    get poule() {
        return this.competitieForm.get('poule');
    }
    get naam() {
        return this.competitieForm.get('naam');
    }
    get maxBeurten() {
        return this.competitieForm.get('maxBeurten');
    }
}
