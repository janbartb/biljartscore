import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild, ViewChild } from '@angular/core';
import { Team, Vereniging } from '../../../../model/vereniging';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { notEmpty } from '../../../../directives/validators.directive';
import { Button } from '../../../../model/button';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { Spelsoort } from '../../../../model/spelsoort';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';

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
    spelsoorten: Spelsoort[] = [];

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
        this.bssApi.updateVereniging(this.vereniging)
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
        this.bssApi.getSpelsoorten()
            .then(result => {
                this.spelsoorten = result;
                Promise.all([
                    this.bssApi.getVereniging(id)
                ])
                    .then(results => {
                        this.vereniging = results[0];
                        let teams = this.vereniging.teams.filter(team => team.spelsoort == this.spelId);
                        this.subtitle = `Vereniging '${this.vereniging.naam}' wijzigen`;
                        this.createVerenigingForm();
                    })
                    .catch((err) => {
                        this.alert.showAlert(err, 'error');
                    });
            })
            .catch(err => {
                this.alert.showAlert(err, 'error');
            });
    }

    private createVerenigingForm() {
        this.verenigingForm = this.fb.nonNullable.group({
            verId: [this.vereniging.verId],
            naam: [this.vereniging.naam, [Validators.required, notEmpty()]],
            korteNaam: [this.vereniging.korteNaam, [Validators.required, notEmpty()]],
            locatie: [this.vereniging.locatie],
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

}
