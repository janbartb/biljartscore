import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { Spelsoort } from '../../model/spelsoort';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates, notEmpty } from '../../directives/validators.directive';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { List } from '../../model/list';
import { BaseComponent } from '../../base/base.component';
import { Alinea, ConfirmDialog } from '../../model/dialogs';
import { Button } from '../../model/button';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-spelsoorten',
    standalone: true,
    imports: [
        PageHeaderComponent, 
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ButtonComponent,
        ConfirmComponent,
        NgClass, 
        ReactiveFormsModule
    ],
    templateUrl: './spelsoorten.component.html',
    styleUrl: './spelsoorten.component.css'
})
export class SpelsoortenComponent extends BaseComponent implements OnInit {
    private fb = inject(FormBuilder);

    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Spelsoorten';
    sectionTitle: string = ' ';
    mode: string = 'edit';
    spelsoorten: Spelsoort[] = [];
    spelsoortLijst: List<Spelsoort> = new List<Spelsoort>();
    spelsoort: Spelsoort = new Spelsoort('', '');
    idxToDelete: number = -1;
    existing: string[] = [];
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    enterButtons: Button[] = [new Button('Enter', 'Opslaan', true)];
    toevoegButtons: Button[] = [new Button('Ins', 'Toevoegen', true)];
    verwijderButtons: Button[] = [new Button('Del', 'Verwijderen', true)];

    spelsoortForm!: FormGroup;

    htmlInputId = viewChild<ElementRef<HTMLInputElement>>("spelsoortid");
    htmlInputNaam = viewChild<ElementRef<HTMLInputElement>>("spelsoortnaam");

    constructor() {
        super();
        effect(() => {
            this.htmlInputNaam()?.nativeElement.select();
            this.htmlInputId()?.nativeElement.focus();
        });
    }

    override escapePressed(): void {
        if (this.mode == 'add' || this.spelsoortLijst.selectedIdx >= 0) {
            this.resetScreen();
            return;
        }
        super.escapePressed();
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
            else if (button.key == 'Ins') {
                this.toevoegenClicked();
            }
            else if (button.key == 'Del') {
                this.verwijderenClicked(this.spelsoortLijst.selectedIdx);
            }
        }, 300);
    }

    enterClicked() {
        if (this.mode == 'add' || this.spelsoortLijst.isItemSelected()) {
            if (this.spelsoortForm && this.spelsoortForm.valid) {
                if (this.mode == 'add') {
                    this.spelsoortToevoegen();
                }
                else {
                    this.spelsoortWijzigen();
                }
            }
        }
    }

    toevoegenClicked() {
        if (this.toevoegButtons[0].disabled) {
            return;
        }
        this.spelsoortLijst.clearSelection();
        this.sectionTitle = 'Spelsoort toevoegen';
        this.mode = 'add';
        this.spelsoort = new Spelsoort('', '', true);
        this.createSpelsoortForm();
        this.toevoegButtons[0].disable();
        this.setEscapeCount();
    }

    spelsoortClicked(idx: number) {
        this.spelsoortLijst.selectItem(idx);
        this.sectionTitle = 'Spelsoort wijzigen';
        this.mode = 'edit';
        let temp = this.spelsoortLijst.getSelectedItem();
        if (temp) {
            this.spelsoort = JSON.parse(JSON.stringify(temp));
            this.createSpelsoortForm();
        }
        else {
            this.spelsoort = new Spelsoort('', '', true);
            this.alert.showError(`Spelsoort met index '${idx}' niet gevonden.`);
        }
        this.toevoegButtons[0].disable();
        this.setEscapeCount();
    }

    verwijderenClicked(idx: number, event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }
        this.idxToDelete = idx;
        this.confirmVerwijderen(this.idxToDelete);
    }

    spelsoortToevoegen() {
        this.spelsoort = this.spelsoortForm.value;
        this.bssApi.addSpelsoort(this.spelsoort)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.resetScreen();
            this.getSpelsoorten();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    spelsoortWijzigen() {
        this.spelsoort.spelsoortNaam = this.spelsoortNaam?.value;
        this.bssApi.updateSpelsoort(this.spelsoort)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.resetScreen();
            this.getSpelsoorten();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    private confirmVerwijderen(idx: number) {
        const toDelete = this.spelsoortLijst.filtered[idx];
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Spelsoort '${toDelete.spelsoortNaam}' verwijderen.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        console.log('confirmed : ' + confirmed);
        if (confirmed) {
            const soort = this.spelsoortLijst.filtered[this.idxToDelete];
            this.bssApi.deleteSpelsoort(soort)
            .then(resp => {
                this.alert.showAlert(resp.message, 'success');
                this.resetScreen();
                this.getSpelsoorten();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        this.isDialogOpen = false;
    }

    onKeydownNaam(event: KeyboardEvent) {
        if (event.key === 'Delete') {
            event.preventDefault();
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.spelsoortLijst.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.spelsoortLijst.selectNextItem();
            }
            this.spelsoortClicked(this.spelsoortLijst.selectedIdx);
            return false;
        }
        if (event.key === 'Enter') {
            if (this.isDialogOpen) {
                return true;
            }
            this.buttonPressed(this.enterButtons[0]);
            return false;
        }
        if (event.key === 'Delete' && this.spelsoortLijst.selectedIdx >= 0) {
            event.preventDefault();
            this.buttonPressed(this.verwijderButtons[0]);
            return false;
        }
        if (event.key === 'Insert' || event.code === 'Equal') {
            this.buttonPressed(this.toevoegButtons[0]);
            return false;
        }
        if (event.key === 'Escape') {
            if (this.isDialogOpen) {
                return true;
            }
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
        this.getSpelsoorten();
    }

    private resetScreen() {
        this.spelsoortLijst.selectedIdx = -1;
        this.mode = 'edit';
        this.sectionTitle = '';
        this.toevoegButtons[0].enable();
        this.setEscapeCount();
    }

    private getSpelsoorten() {
        this.bssApi.getSpelsoorten()
            .then(result => {
                this.spelsoorten = result.filter(srt => !srt.magWeg);
                this.spelsoortLijst.fillItems(result.filter(srt => srt.magWeg));
                this.existing = result.map(srt => srt.spelsoortId);
            })
            .catch(err => {
                this.alert.showError(err);
            });
    }

    private setEscapeCount() {
        this.escapeCount = (this.mode == 'add' || this.spelsoortLijst.selectedIdx >= 0) ? 1 : 0;
    }

    createSpelsoortForm() {
        this.spelsoortForm = this.fb.nonNullable.group({
            spelsoortId: [this.spelsoort.spelsoortId],
            spelsoortNaam: [this.spelsoort.spelsoortNaam, [Validators.required, notEmpty()]],
            magWeg: [true]
        });
        if (this.mode == 'add') {
            this.spelsoortId?.setValidators([Validators.required, notEmpty(), noDuplicates(this.existing)]);
            setTimeout(() => {
                this.htmlInputId()?.nativeElement.focus();                
            }, 200);
        }
        else {
            this.spelsoortId?.disable();
        }
    }

    get spelsoortNaam() {
        return this.spelsoortForm.get('spelsoortNaam');
    }
    get spelsoortId() {
        return this.spelsoortForm.get('spelsoortId');
    }
    get magWeg() {
        return this.spelsoortForm.get('magWeg');
    }
}
