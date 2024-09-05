import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { Spelsoort } from '../../model/spelsoort';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates } from '../../directives/validators.directive';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { ApiResponse } from '../../model/api-response';
import { List } from '../../model/list';
import { BaseComponent } from '../../base/base.component';

@Component({
    selector: 'app-spelsoorten',
    standalone: true,
    imports: [PageHeaderComponent, NgClass, ReactiveFormsModule],
    templateUrl: './spelsoorten.component.html',
    styleUrl: './spelsoorten.component.css'
})
export class SpelsoortenComponent extends BaseComponent implements OnInit {
    private fb = inject(FormBuilder);

    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Spelsoorten';
    mode: string = 'add';
    spelsoorten: Spelsoort[] = [];
    editableList: List<Spelsoort> = new List<Spelsoort>();
    nrOfNonEditItems: number = 0;
    editSpelsoort!: Spelsoort;

    spelsoortForm!: FormGroup;

    htmlInputId = viewChild<ElementRef<HTMLInputElement>>("spelsoortid");
    htmlInputNaam = viewChild<ElementRef<HTMLInputElement>>("spelsoortnaam");

    constructor() {
        super();
        effect(() => {
            this.htmlInputId()?.nativeElement.focus();
        });
    }

    enterPressed() {
        if (this.spelsoortForm.valid) {
            this.saveClicked(this.spelsoortForm.value);
        }
    }

    override escapePressed() {
        if (this.mode == 'edit' || this.spelsoortForm.dirty || this.spelsoortForm.touched) {
            this.cancelClicked();
            return;
        }
        super.escapePressed();
    }

    deletePressed() {
        if (this.editableList.selectedIdx >= 0) {
            this.verwijderSpelsoort(this.editableList.selectedIdx + this.nrOfNonEditItems);
        }
    }

    arrowPressed() {
        if (this.editableList.selectedIdx >= 0) {
            this.prepareWijzigSpelsoort(this.editableList.selectedIdx + this.nrOfNonEditItems);
        }
        else {
            this.cancelClicked();
        }
    }

    prepareWijzigSpelsoort(idx: number) {
        this.editSpelsoort = JSON.parse(JSON.stringify(this.spelsoorten[idx]));
        this.spelId?.setValue(this.editSpelsoort.spelId);
        this.spelNaam?.setValue(this.editSpelsoort.spelNaam);
        this.spelId?.disable();
        this.mode = 'edit';
        this.htmlInputNaam()?.nativeElement.select();
    }

    spelsoortClicked(idx: number) {
        this.editableList.selectItem(idx);
        this.prepareWijzigSpelsoort(this.editableList.selectedIdx + this.nrOfNonEditItems);
    }

    saveClicked(spelsoortFormData: Spelsoort) {
        if (!this.spelsoortForm.valid) {
            return;
        }
        console.log('Saving...');
        console.log(spelsoortFormData);
        if (this.mode == 'add') {
            this.addSpelsoort(spelsoortFormData);
        }
        else {
            this.updateSpelsoort(spelsoortFormData);
        }
    }

    cancelClicked() {
        if (this.mode == 'edit') {
            this.mode = 'add';
            this.spelId?.enable();
        }
        this.spelsoortForm.reset();
        this.editableList.clearSelection();
        this.blurFields();
    } 

    private addSpelsoort(spelsoort: Spelsoort) {
        spelsoort.magWeg = true;
        this.bssApi.addSpelsoort(spelsoort)
        .then((resp: ApiResponse) => {
            this.spelsoorten.push(resp.data);
            this.fillEditableList();
            this.spelsoortForm.reset();
            this.setSpelIdValidators();
            this.blurFields();
            this.alert.showAlert(resp.message, 'success');
        })
        .catch((err) => {
            this.alert.showAlert(err, 'error');
        });
    }

    private updateSpelsoort(spelsoort: Spelsoort) {
        this.editSpelsoort.spelNaam = spelsoort.spelNaam;
        let idx = this.spelsoorten.findIndex(spel => spel.spelId == this.editSpelsoort.spelId);
        if (idx < 0) {
            this.alert.showAlert(`Vreemd! Kan spelsoort '${this.editSpelsoort.spelId}' niet meer vinden in lijst.`, 'error');
            return;
        }
        this.bssApi.updateSpelsoort(this.editSpelsoort)
        .then((resp: ApiResponse) => {
            this.cancelClicked();
            this.spelsoorten[idx] = resp.data;
            this.fillEditableList();
            this.spelsoortForm.reset();
            this.blurFields();
            this.alert.showAlert(resp.message, 'success');
        })
        .catch((err) => {
            this.alert.showAlert(err, 'error');
        });
    }

    verwijderSpelsoort(idx: number) {
        //TODO check of delete is toegestaan
        this.bssApi.deleteSpelsoort(this.spelsoorten[idx])
        .then((resp: ApiResponse) => {
            let x = this.spelsoorten.findIndex(spel => spel.spelId == resp.data.spelId);
            if (x < 0) {
                this.alert.showAlert(`Vreemd! Kan spelsoort '${resp.data.spelId}' niet meer vinden in lijst.`, 'warning');
                return;
            }
            this.spelsoorten.splice(x, 1);
            this.editableList.clearSelection();
            this.fillEditableList();
            this.spelsoortForm.reset();
            this.setSpelIdValidators();
            this.alert.showAlert(resp.message, 'success');
            this.cancelClicked();
        })
        .catch((err) => {
            this.alert.showAlert(err, 'error');
        });
    }

    setSpelIdValidators() {
        this.spelId?.setValidators([Validators.required, noDuplicates(this.spelsoorten.map(x => x.spelId))]);
    }

    private blurFields() {
        this.htmlInputNaam()?.nativeElement.blur();
        this.htmlInputId()?.nativeElement.focus();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.editableList.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.editableList.selectNextItem();
            }
            this.arrowPressed()
            return false;
        }
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.key === 'Delete') {
            this.deletePressed();
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }    
        return true;
    }

    ngOnInit(): void {
        this.previousUrl = 'onderhoud';
        this.bssApi.getSpelsoorten()
            .then((resp: Spelsoort[]) => {
                this.spelsoorten = resp;
                this.createForm();
                this.fillEditableList();
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
    }

    createForm() {
        this.spelsoortForm = this.fb.nonNullable.group({
            spelId: [''],
            spelNaam: ['', Validators.required]
        });
        this.setSpelIdValidators();
    }

    fillEditableList(): void {
        this.editableList.items = this.spelsoorten.filter(spel => spel.magWeg);
        this.nrOfNonEditItems = this.spelsoorten.length - this.editableList.items.length;
    }

    get spelNaam() {
        return this.spelsoortForm.get('spelNaam');
    }
    get spelId() {
        return this.spelsoortForm.get('spelId');
    }
}
