import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../base/base.component';
import { Lokaliteit, Vereniging } from '../../../model/vereniging';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { noDuplicates, notEmpty } from '../../../directives/validators.directive';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { NgClass } from '@angular/common';
import { Button } from '../../../model/button';
import { ConfirmComponent } from '../../../shared/confirm/confirm.component';
import { Alinea, ConfirmDialog } from '../../../model/dialogs';

@Component({
    selector: 'app-lokaliteit',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass,
        ConfirmComponent
    ],
    templateUrl: './lokaliteit.component.html',
    styleUrl: './lokaliteit.component.css'
})
export class LokaliteitComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);
    route = inject(ActivatedRoute);

    subtitle: string = 'Lokaliteit';
    mode: string = 'view';
    lokaliteit: Lokaliteit = new Lokaliteit();
    existingIds: string[] = [];
    lokVerenigingen: Vereniging[] = [];
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    viewButtons: Button[] = [
        new Button('W', 'Wijzigen', true),
        new Button('Del', 'Verwijderen', true)
    ];
    opslaanButtons: Button[] = [
        new Button('Enter', 'Opslaan', true)
    ];

    lokForm!: FormGroup;

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'W') {
                this.wijzigenClicked();
            }
            else if (button.key == 'Del') {
                this.verwijderenClicked();
            }
            else if (button.text == 'Opslaan') {
                this.opslaanClicked();
            }
        }, 300);
    }

    override escapePressed(): void {
        if (this.isDialogOpen) {
            return;
        }
        if (this.mode == 'edit') {
            this.lokForm.reset();
            this.mode = 'view';
            this.subtitle = 'Lokaliteit';
            this.setEscapeCount();
            return;
        }
        super.escapePressed();
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.wijzigenClicked();
        }
        else {
            this.verwijderenClicked();
        }
    }

    opslaanClicked() {
        if (!(this.lokForm && this.lokForm.valid) || this.mode == 'view') {
            return;
        }
        if (this.mode == 'add') {
            this.lokaliteitToevoegen();
        }
        else {
            this.lokaliteitWijzigen();
        }
    }

    wijzigenClicked() {
        this.mode = 'edit';
        this.subtitle = 'Lokaliteit wijzigen';
        this.setEscapeCount();
    }

    verwijderenClicked() {
        this.confirmVerwijderen();
    }

    lokaliteitToevoegen() {
        Object.assign(this.lokaliteit, this.lokForm.value);
        this.bssApi.addLokaliteit(this.lokaliteit)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            super.escapePressed();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    lokaliteitWijzigen() {
        Object.assign(this.lokaliteit, this.lokForm.value);
        this.bssApi.updateLokaliteit(this.lokaliteit)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.mode = 'view';
            this.subtitle = 'Lokaliteit';
            this.createForm();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    private confirmVerwijderen() {
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Lokaliteit '${this.lokaliteit.naam}' verwijderen.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        if (confirmed) {
            this.bssApi.deleteLokaliteit(this.lokaliteit)
            .then(resp => {
                this.alert.showAlert(resp.message, 'success');
                super.escapePressed();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        this.isDialogOpen = false;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.opslaanButtons[0]);
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyW' && this.mode == 'view') {
            this.buttonPressed(this.viewButtons[0]);
            return false;
        }
        if (event.code === 'Delete' && this.mode == 'view' && this.lokVerenigingen.length == 0) {
            this.buttonPressed(this.viewButtons[1]);
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        const id: string | null = this.route.snapshot.paramMap.get('lokId');
        if (!id) {
            this.alert.showAlert('Het ID in de URL is undefined.', 'error');
            return;
        }
        if (id == 'toevoegen') {
            this.mode = 'add';
            this.subtitle = 'Lokaliteit toevoegen';
        }
        if (this.mode == 'add') {
            this.bssApi.getExistingLokaliteitIds()
            .then(data => {
                this.existingIds = data;
                this.createForm();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            Promise.all([
                this.bssApi.getLokaliteit(id),
                this.bssApi.getVerenigingen()
            ])
            .then(data => {
                this.lokaliteit = data[0];
                this.lokVerenigingen = data[1].filter(ver => ver.locatie == this.lokaliteit.lokId);
                this.createForm();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
    }

    private setEscapeCount() {
        this.escapeCount = 0;
        if (this.mode == 'edit') {
            this.escapeCount++;
        }
    }

    private createForm() {
        this.lokForm = this.fb.nonNullable.group({
            lokId: [this.lokaliteit.lokId, [Validators.required, notEmpty()]],
            knbbId: [this.lokaliteit.knbbId],
            naam: [this.lokaliteit.naam, [Validators.required, notEmpty()]],
            adres: [this.lokaliteit.adres],
            postcode: [this.lokaliteit.postcode],
            plaats: [this.lokaliteit.plaats],
            telefoon: [this.lokaliteit.telefoon],
            email: [this.lokaliteit.email]
        });
        if (this.mode == 'add') {
            this.lokId?.addValidators(noDuplicates(this.existingIds));
        }
        else {
            this.lokId?.disable();
        }
        this.escapeCount = 0;
    }

    get lokId() {
        return this.lokForm.get('lokId');
    }
    get knbbId() {
        return this.lokForm.get('knbbId');
    }
    get naam() {
        return this.lokForm.get('naam');
    }
    get adres() {
        return this.lokForm.get('adres');
    }
    get postcode() {
        return this.lokForm.get('postcode');
    }
    get plaats() {
        return this.lokForm.get('plaats');
    }
    get telefoon() {
        return this.lokForm.get('telefoon');
    }
    get email() {
        return this.lokForm.get('email');
    }

}
