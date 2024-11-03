import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Speler, SpelerGemiddelde, SpelerWrapper } from '../../../model/speler';

import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { Spelsoort } from '../../../model/spelsoort';
import { Vereniging, VerenigingKort } from '../../../model/vereniging';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { greaterZero, noDuplicates, notEmpty } from '../../../directives/validators.directive';
import { Button } from '../../../model/button';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { ApiResponse } from '../../../model/api-response';

declare var mySpeechObject: any;

@Component({
  selector: 'app-speler',
  standalone: true,
  imports: [PageHeaderComponent, ButtonComponent, NgClass, FormsModule, ReactiveFormsModule],
  templateUrl: './speler.component.html',
  styleUrl: './speler.component.css'
})
export class SpelerComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);

    subtitle: string = "Speler "
    mode: string = 'edit';
    speler: Speler = new Speler();
    sections: string[] = ['Speler', 'Moyennes', 'Is lid van'];
    spelsoorten: Spelsoort[] = [];
    vereniging: VerenigingKort = new VerenigingKort(new Vereniging());
    verenigingen: VerenigingKort[] = [];
    spelerVerenigingen: VerenigingKort[] = [];
    existingSpelerIds: string[] = [];
    activeSection: number = 0;
    enterButton: Button = new Button('Enter', 'Opslaan', true);

    spelerForm!: FormGroup;

    htmlInputId = viewChild<ElementRef<HTMLInputElement>>("spelerid");

    constructor() {
        super();
        effect(() => {
            this.htmlInputId()?.nativeElement.focus();
        });
    }

    enterPressed() {
        this.enterClicked();
    }

    override escapePressed(): void {
        if (this.mode == 'edit') {
            if (this.spelerForm.dirty || JSON.stringify(this.speler.verenigingIds) != JSON.stringify(this.spelerVerenigingen.map(sv => sv.verId))) {
                this.spelerForm.reset();
                this.setVerenigingenVanSpeler();
                return;
            }    
        }
        super.escapePressed();
    }

    enterClicked() {
        console.log(this.spelerForm);
        if (!this.spelerForm.valid) {
            return;
        }
        Object.assign(this.speler, this.spelerForm.value);
        let spelerMoyenne = this.speler.gemiddeldes.find(gem => gem.spelId == this.spelId);
        if (spelerMoyenne) {
            spelerMoyenne.gemiddelde = this.moyenne?.value;
        }
        else {
            this.speler.gemiddeldes.push({ spelId: this.spelId, gemiddelde: this.moyenne?.value });
        }
        this.speler.verenigingIds = this.spelerVerenigingen.map(sv => sv.verId);
        console.log(this.speler);
        if (this.mode == 'add') {
            this.addSpeler();
        }
        else {
            this.updateSpeler();
        }
    }

    naamUitspreken(): void {
        const naam = (this.spreeknaam?.value.trim().length) ? this.spreeknaam?.value.trim() : this.vnaam?.value.trim();
        mySpeechObject.speak(naam);
    }

    verenigingClicked(verKort: VerenigingKort) {
        this.appData.gotoPage(this.router.url, 'onderhoud/verenigingen/' + verKort.verId);
    }

    addSpeler() {
        this.bssApi.addSpeler(this.speler)
        .then((resp: ApiResponse) => {
            this.alert.showAlert(resp.message, 'success');
            this.escapePressed();
        })
        .catch(err => {
            this.alert.showAlert(err, 'error');
        });
    }

    updateSpeler() {
        this.bssApi.updateSpeler(this.speler)
        .then((resp: ApiResponse) => {
            this.alert.showAlert(resp.message, 'success');
            this.subtitle = this.getSubtitle();
            this.createSpelerForm();
        })
        .catch(err => {
            this.alert.showAlert(err, 'error');
        });
    }

    addVereniging() {
        if (!this.vereniging) {
            return;
        }
        const found = this.spelerVerenigingen.find(sv => sv.verId == this.vereniging.verId);
        if (!found) {
            this.spelerVerenigingen.push(this.vereniging);
        }
        this.vereniging = new VerenigingKort(new Vereniging());
    }

    removeVereniging(toRemove: VerenigingKort) {
        this.spelerVerenigingen = this.spelerVerenigingen.filter(ver => ver.verId != toRemove.verId);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowLeft' || event.key ==='ArrowRight') {
            // if (event.key === 'ArrowLeft') {
            //     this.activateOtherSection(--this.activeSection);
            // }
            // if (event.key === 'ArrowRight') {
            //     this.activateOtherSection(++this.activeSection);
            // }
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
        // if (event.key === '+' || event.key === '=') {
        //     this.buttonPressed('+');
        //     return false;
        // }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }    
        return true;
    }

    // activateOtherSection(idx: number) {
    //     if (idx >= this.sections.length) {
    //         idx = 0;
    //     }
    //     if (idx < 0) {
    //         idx = this.sections.length - 1;
    //     }
    //     this.activateSection(idx);
    // }

    ngOnInit(): void {
        const id: string | null = this.route.snapshot.paramMap.get('spelerId');
        if (!id) {
            this.alert.showAlert('Het ID in de URL is undefined.', 'error');
            return;
        }
        if (this.spelId == '') {
            this.alert.showAlert('Gekozen spel is leeg. Ga terug naar de Home pagina.', 'error');
            return;
        }

        Promise.all([
            this.bssApi.getSpelsoorten(),
            this.bssApi.getVerenigingen()
        ])
        .then((results) => {
            this.spelsoorten = results[0];
            if (id != 'toevoegen') {
                this.subtitle += 'wijzigen';
                this.bssApi.getSpeler(id)
                .then((result: Speler) => {
                    this.speler = result;
                    this.subtitle = this.getSubtitle();
                    this.verenigingen = results[1].map((result: Vereniging) => {
                        let verKort = new VerenigingKort(result);
                        verKort.inTeam = result.teams.some(team => team.teamLeden.some(lid => lid == this.speler.id));
                        return verKort;
                    });
                    this.setVerenigingenVanSpeler();
                    this.createSpelerForm();

                })
                .catch((err) => {
                    this.alert.showAlert(err, 'error');
                });
            }
            else {
                this.mode = 'add';
                this.subtitle += 'toevoegen';
                this.verenigingen = results[1].map((result) => new VerenigingKort(result));
                this.bssApi.getExistingSpelerIds()
                .then((result: string[]) => {
                    this.existingSpelerIds = result;
                    this.createSpelerForm();
                })
                .catch((err) => {
                    this.alert.showAlert(err, 'error');
                });
            }
        })
        .catch((err) => {
            this.alert.showAlert(err, 'error');
        });
    }

    createSpelerForm() {
        this.spelerForm = this.fb.nonNullable.group({
            id: [this.speler.id],
            knbbId: [this.speler.knbbId],
            vnaam: [this.speler.vnaam, [Validators.required, notEmpty()]],
            tvoeg: [this.speler.tvoeg],
            anaam: [this.speler.anaam, [Validators.required, notEmpty()]],
            spreeknaam: [this.speler.spreeknaam.length ? this.speler.spreeknaam : this.speler.vnaam],
            moyenne: [this.getSpelsoortGemiddelde(this.spelId), [Validators.required, greaterZero()]]
        });
        if (this.mode == 'add') {
            this.id?.setValidators([Validators.required, notEmpty(), noDuplicates(this.existingSpelerIds)]);
        }
        else {
            this.id?.disable();
        }
    }

    getSpelsoortGemiddelde(id: string): number {
        const spelerGem = this.speler.gemiddeldes.find(gem => gem.spelId == id);
        return spelerGem ? spelerGem.gemiddelde : 0;
    }

    setVerenigingenVanSpeler(): void {
        this.spelerVerenigingen = this.verenigingen.filter((ver) => {
            return this.speler.verenigingIds.some(id => id == ver.verId);
        })
    }

    private getSubtitle() {
        if (this.mode == 'add') {
            return 'Speler toevoegen';
        }
        const naam = new SpelerWrapper(this.speler).getNaam();
        return `Speler '${naam}' wijzigen`;
    }

    get id() {
        return this.spelerForm.get('id');
    }
    get knbbId() {
        return this.spelerForm.get('knbbId');
    }
    get vnaam() {
        return this.spelerForm.get('vnaam');
    }
    get tvoeg() {
        return this.spelerForm.get('tvoeg');
    }
    get anaam() {
        return this.spelerForm.get('anaam');
    }
    get spreeknaam() {
        return this.spelerForm.get('spreeknaam');
    }
    get moyenne() {
        return this.spelerForm.get('moyenne');
    }

}
