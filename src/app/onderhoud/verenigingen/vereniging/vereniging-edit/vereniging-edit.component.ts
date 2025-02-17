import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild, ViewChild } from '@angular/core';
import { Lokaliteit, Team, Vereniging } from '../../../../model/vereniging';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { notEmpty } from '../../../../directives/validators.directive';
import { Button } from '../../../../model/button';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { Spelsoort } from '../../../../model/spelsoort';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';
import { Config } from '../../../../model/config';
import { ApiResponse } from '../../../../model/api-response';

@Component({
    selector: 'app-vereniging-edit',
    standalone: true,
    imports: [
        ReactiveFormsModule, 
        NgClass, 
        PageHeaderComponent, 
        SectionFooterBtnsComponent
    ],
    templateUrl: './vereniging-edit.component.html',
    styleUrl: './vereniging-edit.component.css'
})
export class VerenigingEditComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);
    route = inject(ActivatedRoute);

    subtitle: string = "Vereniging"
    vereniging: Vereniging = new Vereniging();
    lokaliteiten: Lokaliteit[] = [];
    config: Config = new Config();

    enterButtons: Button[] = [new Button('Enter', 'Opslaan', true)];

    htmlInputKnbbId = viewChild<ElementRef<HTMLInputElement>>("knbbid");

    verenigingForm!: FormGroup;

    constructor() {
        super();
        effect(() => {
            this.htmlInputKnbbId()?.nativeElement.focus();
        });
    }

    enterPressed() {
        this.enterButtons[0].selected = true;
        setTimeout(() => {
            this.enterButtons[0].selected = false;
            this.opslaanClicked();
        }, 300);
    }

    opslaanClicked() {
        if (!this.verenigingForm.valid) {
            return;
        }
        Object.assign(this.vereniging, this.verenigingForm.value);
        let promises: Promise<ApiResponse>[] = [this.bssApi.updateVereniging(this.vereniging)];
        if (this.voorkeur?.value) {
            this.config.vereniging = this.vereniging.verId;
            promises.push(this.bssApi.saveConfig(this.config));
        }
        Promise.all(promises)
        .then(resps => {
            this.alert.showAlert(resps[0].message, 'success');
            this.escapePressed();
        })
        .catch(err => {
            this.alert.showError(err);
        })
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
        const id: string | null = this.route.snapshot.paramMap.get('verId');
        if (!id) {
            this.alert.showAlert('Het ID in de URL is undefined.', 'error');
            return;
        }
        Promise.all([
            this.bssApi.getVereniging(id),
            this.bssApi.getLokaliteiten(),
            this.bssApi.getConfig()
        ])
        .then(results => {
            this.vereniging = results[0];
            this.lokaliteiten = results[1];
            this.config = results[2];
            this.lokaliteiten.sort(this.compareLokaliteiten);
            this.subtitle = `Vereniging '${this.vereniging.naam}' wijzigen`;
            this.createVerenigingForm();
        })
        .catch((err) => {
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
            verId: [this.vereniging.verId],
            naam: [this.vereniging.naam, [Validators.required, notEmpty()]],
            korteNaam: [this.vereniging.korteNaam, [Validators.required, notEmpty()]],
            locatie: [this.vereniging.locatie],
            voorkeur: [this.vereniging.verId == this.config.vereniging]
        });
        this.verId?.disable();
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
