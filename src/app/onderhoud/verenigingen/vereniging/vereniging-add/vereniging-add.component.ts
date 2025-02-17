import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../../base/base.component';
import { Lokaliteit, Vereniging } from '../../../../model/vereniging';
import { Button } from '../../../../model/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates, notEmpty } from '../../../../directives/validators.directive';
import { NgClass } from '@angular/common';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';
import { Config } from '../../../../model/config';
import { ApiResponse } from '../../../../model/api-response';

@Component({
    selector: 'app-vereniging-add',
    standalone: true,
    imports: [
        PageHeaderComponent, 
        SectionFooterBtnsComponent,
        ReactiveFormsModule, 
        NgClass
    ],
    templateUrl: './vereniging-add.component.html',
    styleUrl: './vereniging-add.component.css'
})
export class VerenigingAddComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    subtitle: string = 'Vereniging toevoegen';
    vereniging: Vereniging = new Vereniging();
    existingVerenigingIds: string[] = [];
    lokaliteiten: Lokaliteit[] = [];
    config: Config = new Config();
    buttons: Button[] = [new Button('Enter', 'Opslaan', true)];

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
        this.vereniging.verId = this.verId?.value;
        this.vereniging.naam = this.naam?.value;
        this.vereniging.korteNaam = this.korteNaam?.value;
        this.vereniging.locatie = this.locatie?.value;
        let promises: Promise<ApiResponse>[] = [this.bssApi.addVereniging(this.vereniging)];
        if (this.voorkeur?.value) {
            this.config.vereniging = this.vereniging.verId;
            promises.push(this.bssApi.saveConfig(this.config));
        }
        Promise.all(promises)
        .then(resps => {
            let msg = `Vereniging '${this.vereniging.naam}' is toegevoegd`;
            msg += (this.voorkeur?.value) ? ' en als voorkeur gezet.' : '.';
            this.alert.showAlert(msg, 'success');
            this.escapePressed();
        })
        .catch(err => {
            this.alert.showAlert(err, 'error');
        });        
    }

    voorkeurClicked() {
        this.voorkeur?.setValue(!this.voorkeur.value);
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
        Promise.all([
            this.bssApi.getExistingVerenigingIds(),
            this.bssApi.getLokaliteiten(),
            this.bssApi.getConfig()
        ])
        .then(results => {
            this.existingVerenigingIds = results[0];
            this.lokaliteiten = results[1];
            this.lokaliteiten.sort(this.compareLokaliteiten);
            this.config = results[2];
            this.createVerenigingForm();
        })
        .catch(err => {
            this.alert.showAlert(err, 'error');
        });
    }

    private compareLokaliteiten(a: Lokaliteit, b: Lokaliteit): number {
        if (a.naam == b.naam) {
            return 0;
        }
        return (a.naam > b.naam) ? 1 : -1;
    }

    private createVerenigingForm() {
        this.verenigingForm = this.fb.nonNullable.group({
            verId: [this.vereniging.verId, [Validators.required, notEmpty(), noDuplicates(this.existingVerenigingIds)]],
            naam: [this.vereniging.naam, [Validators.required, notEmpty()]],
            korteNaam: [this.vereniging.korteNaam, [Validators.required, notEmpty()]],
            locatie: [''],
            voorkeur: [false]
        });
    }

    get verId() {
        return this.verenigingForm.get('verId');
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
    get voorkeur() {
        return this.verenigingForm.get('voorkeur');
    }

}
