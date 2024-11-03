import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../../base/base.component';
import { Vereniging } from '../../../../model/vereniging';
import { Button } from '../../../../model/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/button-group/button/button.component';
import { noDuplicates, notEmpty } from '../../../../directives/validators.directive';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-vereniging-add',
  standalone: true,
  imports: [PageHeaderComponent, ButtonComponent, ReactiveFormsModule, NgClass],
  templateUrl: './vereniging-add.component.html',
  styleUrl: './vereniging-add.component.css'
})
export class VerenigingAddComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    subtitle: string = 'Vereniging toevoegen';
    vereniging: Vereniging = new Vereniging();
    existingVerenigingIds: string[] = [];
    enterButton: Button = new Button('Enter', 'Opslaan', true);

    verenigingForm!: FormGroup;

    htmlInputId = viewChild<ElementRef<HTMLInputElement>>("verenigingid");

    constructor() {
        super();
        effect(() => {
            this.htmlInputId()?.nativeElement.focus();
        });
    }

    enterPressed() {
        this.enterClicked();
    }

    enterClicked() {
        if (!this.verenigingForm.valid) {
            return;
        }
        Object.assign(this.vereniging, this.verenigingForm.value);
        this.bssApi.addVereniging(this.vereniging)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.escapePressed();
        })
        .catch(err => {
            this.alert.showAlert(err, 'error');
        });
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.enterPressed();
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
        this.bssApi.getExistingVerenigingIds()
        .then(result => {
            this.existingVerenigingIds = result;
            this.createVerenigingForm();
        })
        .catch(err => {
            this.alert.showAlert(err, 'error');
        });
    }

    private createVerenigingForm() {
        this.verenigingForm = this.fb.nonNullable.group({
            verId: [this.vereniging.verId, [Validators.required, notEmpty(), noDuplicates(this.existingVerenigingIds)]],
            knbbId: [this.vereniging.knbbId],
            naam: [this.vereniging.naam, [Validators.required, notEmpty()]],
            korteNaam: [this.vereniging.korteNaam, [Validators.required, notEmpty()]],
            locatie: [this.vereniging.locatie],
            plaats: [this.vereniging.plaats]
        });
    }

    get verId() {
        return this.verenigingForm.get('verId');
    }
    get knbbId() {
        return this.verenigingForm.get('knbbId');
    }
    get naam() {
        return this.verenigingForm.get('naam');
    }
    get korteNaam() {
        return this.verenigingForm.get('korteNaam');
    }
    get locatie() {
        return this.verenigingForm.get('locatie');
    }
    get plaats() {
        return this.verenigingForm.get('plaats');
    }

}
