import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { List } from '../../model/list';
import { District } from '../../model/district';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { Button } from '../../model/button';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { noDuplicates, notEmpty } from '../../directives/validators.directive';
import { Alinea, ConfirmDialog } from '../../model/confirm-dialog';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-knbb-districten',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ButtonComponent,
        ConfirmComponent,
        FormsModule,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './knbb-districten.component.html',
    styleUrl: './knbb-districten.component.css'
})
export class KnbbDistrictenComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    subtitle: string = 'KNBB districten';
    sectionTitle: string = ' ';
    districtLijst: List<District> = new List<District>();
    district: District = new District();
    idxToDelete: number = -1;
    existing: string[] = [];
    mode: string = 'edit';
    naamFilter: string = '';
    escapeCount: number = 0;
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    enterButtons: Button[] = [new Button('Enter', 'Opslaan', true)];
    toevoegButtons: Button[] = [new Button('+', 'Toevoegen', true)];
    verwijderButtons: Button[] = [new Button('Del', 'Verwijderen', true)];

    districtForm!: FormGroup;

    htmlInputId = viewChild<ElementRef<HTMLInputElement>>("districtid");
    htmlInputNaam = viewChild<ElementRef<HTMLInputElement>>("districtnaam");

    constructor() {
        super();
        effect(() => {
            this.htmlInputNaam()?.nativeElement.select();
            this.htmlInputId()?.nativeElement.focus();
        });
    }

    override escapePressed(): void {
        if (this.mode == 'add' || this.districtLijst.selectedIdx >= 0) {
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
                this.verwijderenClicked(this.districtLijst.selectedIdx);
            }
        }, 300);
    }

    enterClicked() {
        if (this.mode == 'add' || this.districtLijst.isItemSelected()) {
            if (this.districtForm && this.districtForm.valid) {
                if (this.mode == 'add') {
                    this.districtToevoegen();
                }
                else {
                    this.districtWijzigen();
                }
            }
        }
    }

    toevoegenClicked() {
        if (this.toevoegButtons[0].disabled) {
            return;
        }
        this.districtLijst.clearSelection();
        this.sectionTitle = 'District toevoegen';
        this.mode = 'add';
        this.district = new District();
        this.createDisctrictForm();
        this.toevoegButtons[0].disable();
        this.setEscapeCount()
    }

    districtClicked(idx: number) {
        this.districtLijst.selectItem(idx);
        this.sectionTitle = 'District wijzigen';
        this.mode = 'edit';
        let temp = this.districtLijst.getSelectedItem();
        if (temp) {
            this.district = JSON.parse(JSON.stringify(temp));
            this.createDisctrictForm();
        }
        else {
            this.district = new District();
            this.alert.showError(`District met index '${idx}' niet gevonden.`);
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

    districtToevoegen() {
        this.district = this.districtForm.value;
        this.bssApi.addDistrict(this.district)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.getDistricten();
            this.toevoegenClicked();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    districtWijzigen() {
        this.district.disNaam = this.disNaam?.value;
        this.bssApi.updateDistrict(this.district)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.resetScreen();
            this.getDistricten();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    private confirmVerwijderen(idx: number) {
        const toDelete = this.districtLijst.filtered[idx];
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`District '${toDelete.disNaam}' verwijderen.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        console.log('confirmed : ' + confirmed);
        if (confirmed) {
            const district = this.districtLijst.filtered[this.idxToDelete];
            this.bssApi.deleteDistrict(district.disId)
            .then(resp => {
                this.alert.showAlert(resp.message, 'success');
                this.resetScreen();
                this.getDistricten();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        this.isDialogOpen = false;
    }

    naamFilterChanged() {
        if (!this.naamFilter.trim().length) {
            this.districtLijst.filter((item: District) => { return true; });
            return;
        }
        const filter = this.naamFilter.trim().toLowerCase();
        this.districtLijst.filter((item: District) => item.disNaam.toLowerCase().indexOf(filter) >= 0);
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
                this.districtLijst.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.districtLijst.selectNextItem();
            }
            this.districtClicked(this.districtLijst.selectedIdx);
            return false;
        }
        if (event.key === 'Enter') {
            if (this.isDialogOpen) {
                return true;
            }
            this.buttonPressed(this.enterButtons[0]);
            return false;
        }
        if (event.key === 'Delete' && this.districtLijst.selectedIdx >= 0) {
            event.preventDefault();
            this.buttonPressed(this.verwijderButtons[0]);
            return false;
        }
        if (event.key === 'Insert') {
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
        this.getDistricten();
    }

    private resetScreen() {
        this.districtLijst.selectedIdx = -1;
        this.mode = 'edit';
        this.sectionTitle = '';
        this.toevoegButtons[0].enable();
        this.setEscapeCount();
    }

    private getDistricten() {
        this.bssApi.getKnbbDistricten()
            .then(result => {
                result.sort(this.compareDistricten);
                this.districtLijst.fillItems(result);
                this.existing = result.map(district => district.disId);
                this.naamFilterChanged();
            })
            .catch(err => {
                this.alert.showError(err);
            });
    }

    private setEscapeCount() {
        this.escapeCount = (this.mode == 'add' || this.districtLijst.selectedIdx >= 0) ? 1 : 0;
    }

    private compareDistricten(a: District, b: District): number {
        if (a.disNaam == b.disNaam) {
            return a.disId < b.disId ? -1 : 1;
        }
        return a.disNaam < b.disNaam ? -1 : 1;
    }

    private createDisctrictForm() {
        this.districtForm = this.fb.nonNullable.group({
            disId: [this.district.disId],
            disNaam: [this.district.disNaam, [Validators.required, notEmpty()]],
        });
        if (this.mode == 'add') {
            this.disId?.setValidators([Validators.required, notEmpty(), noDuplicates(this.existing)]);
            setTimeout(() => {
                this.htmlInputId()?.nativeElement.focus();                
            }, 200);
        }
        else {
            this.disId?.disable();
        }
    }

    get disId() {
        return this.districtForm.get('disId');
    }
    get disNaam() {
        return this.districtForm.get('disNaam');
    }
}
