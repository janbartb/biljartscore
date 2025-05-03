import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { NgClass } from '@angular/common';
import { BaseComponent } from '../../base/base.component';
import { BpCompetitie, BpTeam, CompPageData, TeamTemp } from '../../model/bpoint';
import { KnbbCompetitie } from '../../model/knbb-competitie';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../model/button';
import { noDuplicates, notEmpty } from '../../directives/validators.directive';

@Component({
    selector: 'app-bp-competitie',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        SectionHeaderComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './bp-competitie.component.html',
    styleUrl: './bp-competitie.component.css'
})
export class BpCompetitieComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    bpComp: BpCompetitie = new BpCompetitie();
    bssComp: KnbbCompetitie = new KnbbCompetitie();
    pageData: CompPageData = new CompPageData();
    existingCompIds: string[] = [];
    sectTitle: string = 'in BSS';
    mode: string = 'view';
    dataReady: boolean = false;

    saveButtons: Button[] = [new Button('Enter', 'Opslaan', true)];
    addButtons: Button[] = [new Button('Enter', 'Toevoegen aan BSS', true)];
    pageButtons: Button[] = [
        new Button('W', 'Wijzigen', true),
        new Button('Enter', 'Naar teams', true)
    ];

    compForm!: FormGroup | null;

    override escapePressed(): void {
        if (this.mode != 'view') {
            this.compForm?.reset();
            this.mode = 'view';
            this.sectTitle = 'in BSS';
            this.setEscapeCount();
            return;
        }
        this.router.navigate(['bpoint/competities']);
    }

    override previousPressed(): void {
        this.router.navigate(['bpoint/competities']);
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'W') {
                this.wijzigenClicked();
            }
            else {
                if (this.mode == 'view') {
                    if (this.bpComp.inBss) {
                        this.naarTeamsClicked();
                    }
                    else {
                        this.toevoegenClicked();
                    }
                }
                else {
                    this.opslaanClicked();
                }
            }
        }, 300);
    }

    pageButtonClicked(idx: number) {
        if (idx == 0) {
            this.wijzigenClicked();
        }
        else {
            this.naarTeamsClicked();
        }
    }

    toevoegenClicked() {
        this.createCompForm(true);
        this.mode = 'add';
        this.sectTitle = 'Toevoegen aan BSS';
        this.setEscapeCount()
    }

    wijzigenClicked() {
        this.createCompForm();
        this.mode = 'edit';
        this.sectTitle = 'Wijzigen in BSS';
        this.setEscapeCount()
    }

    naarTeamsClicked() {
        this.router.navigate(['bpoint/compteams']);
    }

    opslaanClicked() {
        if (!this.compForm?.valid) {
            this.alert.showError('Het formulier is niet correct ingevuld.');
            return;
        }
        Object.assign(this.bssComp, this.compForm?.value);
        if (this.mode == 'add') {
            this.competitieToevoegen();
        }
        else {
            this.competitieWijzigen();
        }
    }

    private competitieToevoegen() {
        this.bssApi.addKnbbCompetitie(this.bssComp)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.createCompForm();
            this.bpComp.inBss = true;
            localStorage.setItem('bpComp', JSON.stringify(this.bpComp));
            this.sectTitle = 'in BSS';
            this.mode = 'view';
            this.setEscapeCount();
        })
        .catch(err => {
            this.alert.showError(err);
        });    
    }

    private competitieWijzigen() {
        this.bssApi.updateKnbbCompetitie(this.bssComp)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.createCompForm();
            this.sectTitle = 'in BSS';
            this.mode = 'view';
            this.setEscapeCount();
        })
        .catch(err => {
            this.alert.showError(err);
        });    
    }

    @HostListener('document:keyup', ['$event'])
        handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Escape') {
            if (this.isDialogOpen) {
                return true;
            }
            this.escapePressed();
            return false;
        }
        if (event.key === 'Enter') {
            if (this.mode == 'view') {
                if (this.bpComp.inBss) {
                    this.buttonPressed(this.pageButtons[1]);
                }
                else {
                    this.buttonPressed(this.addButtons[0]);
                }
            }
            else {
                this.buttonPressed(this.saveButtons[0]);
            }
            return false;
        }
        if (event.code === 'KeyW') {
            if (this.mode == 'view' && this.bpComp.inBss) {
                this.buttonPressed(this.pageButtons[0]);
                return false;    
            }
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        const cmp = localStorage.getItem('bpComp');
        if (!cmp) {
            this.alert.showError('Geen competitie geselecteerd.');
            return;
        }
        this.bpComp = JSON.parse(cmp);
        Promise.all([
            this.bssApi.getKnbbCompetities(this.bpComp.district.disId, this.bpComp.spelsoortId),
            this.bssApi.getCompFromBiljartpoint(this.bpComp.poule, this.bpComp.knbbId, '86')
        ])
        .then(results => {
            const bssComps: KnbbCompetitie[] = results[0];
            this.existingCompIds = bssComps.map(cmp => cmp.competitieId);
            this.pageData = results[1];
            this.bpComp.maxBeurten = this.pageData.maxBeurten;
            let teams: BpTeam[] = [];
            this.pageData.teams.forEach(tm => teams.push(this.createBpTeam(tm)));
            this.bpComp.teams = teams;
            localStorage.setItem('bpComp', JSON.stringify(this.bpComp));
            if (this.bpComp.inBss) {
                const foundBssComp = bssComps.find(cmp => cmp.competitieId == this.bpComp.bssId);
                if (foundBssComp) {
                    this.bssComp = foundBssComp;
                    if (this.bssCompEqualsBpComp()) {
                        this.naarTeamsClicked();
                        return;
                    }
                }
                this.createCompForm();
            }
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private bssCompEqualsBpComp(): boolean {
        if (this.bpComp.district.disId != this.bssComp.district || this.bpComp.seizoen != this.bssComp.seizoen) {
            return false;
        }
        if (this.bpComp.spelsoortId != this.bssComp.spelsoort || this.bpComp.knbbId != this.bssComp.knbbId) {
            return false;
        }
        if (this.bpComp.klasse != this.bssComp.klasse || +this.bpComp.volgNr != this.bssComp.volgNr || +this.bpComp.poule != this.bssComp.poule) {
            return false;
        }
        if (this.bpComp.naam != this.bssComp.naam || +this.bpComp.maxBeurten != this.bssComp.maxBeurten) {
            return false;
        }
        return true;
    }

    private createBpTeam(tm: TeamTemp): BpTeam {
        let team = new BpTeam();
        team.naam = tm.naam;
        team.bpUrl = tm.bpUrl;
        const idPosStart = team.bpUrl.indexOf('team_id=') + 8;
        const idPosEnd = team.bpUrl.indexOf('&compid=')
        team.knbbId = team.bpUrl.substring(idPosStart, idPosEnd);
        return team;
    }

    private setEscapeCount() {
        this.escapeCount = (this.mode == 'view') ? 0 : 1;
    }

    private createCompForm(forAdd?: boolean) {
        if (forAdd) {
            console.log('forAdd');
            this.compForm = this.fb.nonNullable.group({
                competitieId: [this.bpComp.bssId, [Validators.required, notEmpty(), noDuplicates(this.existingCompIds)]],
                knbbId: [this.bpComp.knbbId, [Validators.required, notEmpty()]],
                seizoen: [this.bpComp.seizoen, [Validators.required, notEmpty()]],
                district: [this.bpComp.district.disId, [Validators.required, notEmpty()]],
                spelsoort: [this.bpComp.spelsoortId, [Validators.required, notEmpty()]],
                klasse: [this.bpComp.klasse, [Validators.required, notEmpty()]],
                volgNr: [+this.bpComp.volgNr, [Validators.required, Validators.min(1)]],
                poule: [+this.bpComp.poule, [Validators.required, Validators.min(1)]],
                naam: [this.bpComp.naam, [Validators.required, notEmpty()]],
                maxBeurten: [+this.bpComp.maxBeurten, [Validators.required, Validators.min(1)]]
            });
        }
        else {
            this.compForm = this.fb.nonNullable.group({
                competitieId: [this.bssComp.competitieId],
                knbbId: [this.bssComp.knbbId, [Validators.required, notEmpty()]],
                seizoen: [this.bssComp.seizoen, [Validators.required, notEmpty()]],
                district: [this.bssComp.district, [Validators.required, notEmpty()]],
                spelsoort: [this.bssComp.spelsoort, [Validators.required, notEmpty()]],
                klasse: [this.bssComp.klasse, [Validators.required, notEmpty()]],
                volgNr: [this.bssComp.volgNr, [Validators.required, Validators.min(1)]],
                poule: [this.bssComp.poule, [Validators.required, Validators.min(1)]],
                naam: [this.bssComp.naam, [Validators.required, notEmpty()]],
                maxBeurten: [this.bssComp.maxBeurten, [Validators.required, Validators.min(1)]]
            });
            this.volgNr?.disable();
        }
    }

    get competitieId() {
        return this.compForm?.get('competitieId');
    }
    get knbbId() {
        return this.compForm?.get('knbbId');
    }
    get seizoen() {
        return this.compForm?.get('seizoen');
    }
    get district() {
        return this.compForm?.get('district');
    }
    get spelsoort() {
        return this.compForm?.get('spelsoort');
    }
    get klasse() {
        return this.compForm?.get('klasse');
    }
    get volgNr() {
        return this.compForm?.get('volgNr');
    }
    get poule() {
        return this.compForm?.get('poule');
    }
    get naam() {
        return this.compForm?.get('naam');
    }
    get maxBeurten() {
        return this.compForm?.get('maxBeurten');
    }

}
