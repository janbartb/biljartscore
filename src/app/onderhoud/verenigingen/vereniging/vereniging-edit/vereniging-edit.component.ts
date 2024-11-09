import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild, ViewChild } from '@angular/core';
import { Team, Vereniging } from '../../../../model/vereniging';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { noDuplicates, notEmpty } from '../../../../directives/validators.directive';
import { ButtonComponent } from '../../../../shared/button-group/button/button.component';
import { Button } from '../../../../model/button';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { List } from '../../../../model/list';
import { SpelerWrapper } from '../../../../model/speler';
import { Spelsoort } from '../../../../model/spelsoort';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-vereniging-edit',
    standalone: true,
    imports: [
        ReactiveFormsModule, 
        NgClass, 
        PageHeaderComponent, 
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ButtonComponent],
    templateUrl: './vereniging-edit.component.html',
    styleUrl: './vereniging-edit.component.css'
})
export class VerenigingEditComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);
    route = inject(ActivatedRoute);

    subtitle: string = "Vereniging"
    sections: string[] = ['Vereniging', 'Teams', 'Leden'];
    vereniging: Vereniging = new Vereniging();
    teamLijst: List<Team> = new List<Team>();
    ledenLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
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
                    this.bssApi.getVereniging(id),
                    this.bssApi.getLedenVanVereniging(id, this.spelId)
                ])
                    .then(results => {
                        this.vereniging = results[0];
                        let teams = this.vereniging.teams.filter(team => team.spelsoort == this.spelId);
                        this.teamLijst.fillItems(teams);
                        this.sortTeams();
                        this.ledenLijst.fillItems(results[1]);
                        this.sortLeden();
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

    private sortTeams() {
        this.teamLijst.filtered.sort((a: Team, b: Team) => {
            if (a.klasse == b.klasse) {
                return (a.teamId > b.teamId) ? 1 : -1;
            }
            else {
                return (a.klasse > b.klasse) ? 1 : -1;
            }
        });
    }

    private sortLeden() {
        this.ledenLijst.filtered.sort((a: SpelerWrapper, b: SpelerWrapper) => {
            if (a.getNaam() == b.getNaam()) {
                return 0;
            }
            else {
                return (a.getNaam() > b.getNaam()) ? 1 : -1;
            }
        });
    }

    private createVerenigingForm() {
        this.verenigingForm = this.fb.nonNullable.group({
            verId: [this.vereniging.verId],
            knbbId: [this.vereniging.knbbId],
            naam: [this.vereniging.naam, [Validators.required, notEmpty()]],
            korteNaam: [this.vereniging.korteNaam, [Validators.required, notEmpty()]],
            locatie: [this.vereniging.locatie],
            plaats: [this.vereniging.plaats]
        });
        this.verId?.disable();
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
