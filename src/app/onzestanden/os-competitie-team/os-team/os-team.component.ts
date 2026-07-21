import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BpCompetitie, BpTeam, TeamPageSpeler } from '../../../model/bpoint';
import { KnbbCompetitie, KnbbCompTeam } from '../../../model/knbb-competitie';
import { Team, Vereniging } from '../../../model/vereniging';
import { Button } from '../../../model/button';
import { notEmpty } from '../../../directives/validators.directive';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { HelpComponent } from '../../../shared/help/help.component';
import { NgClass } from '@angular/common';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';

@Component({
    selector: 'app-os-team',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        HelpComponent,
        ReactiveFormsModule,
        FormsModule,
        NgClass,
        ButtonComponent
    ],
    templateUrl: './os-team.component.html',
    styleUrl: './os-team.component.css'
})
export class OsTeamComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    bpComp: BpCompetitie = new BpCompetitie();
    bssComp: KnbbCompetitie = new KnbbCompetitie();
    bpTeam: BpTeam = new BpTeam();
    bssTeam: Team = new Team();
    bssTeams: Team[] = [];
    bpSpelers: TeamPageSpeler[] = [];
    vereniging: Vereniging = new Vereniging();
    existingTeamIds: string[] = [];
    sectTitleTeam: string = 'BSS team';
    modeTeam: string = 'view';
    teamInBss: boolean = false;
    teamInComp: boolean = false;
    teamIdOk: boolean = false;
    dataReady: boolean = false;

    teamButton: Button = new Button('', 'Nieuw team', false);
    saveButtons: Button[] = [new Button('Enter', 'Opslaan', true)];
    pageButtons: Button[] = [
        new Button('Enter', 'Naar spelers', true)
    ];

    teamForm!: FormGroup | null;

    override escapePressed(): void {
        if (this.escapeCount > 0) {
            if (this.bssTeams.length > 0) {
                this.bssTeam = this.bssTeams[0];
                this.sectTitleTeam = 'BSS team selecteren of toevoegen';
                this.modeTeam = 'view';
                this.teamForm = null;
            }
            this.escapeCount = 0;
            return;
        }
        this.router.navigate(['onzestanden/vereniging']);
    }

    override previousPressed(): void {
        this.router.navigate(['onzestanden/compteams']);
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.text == 'Opslaan') {
                this.opslaanClicked();
            }
            else {
                this.naarSpelersClicked();
            }
        }, 300);
    }

    naarSpelersClicked() {
        this.bpTeam.bssTeamId = this.bssTeam.teamId;
        localStorage.setItem('bpTeam', JSON.stringify(this.bpTeam));
        if (this.bssTeam.knbbId != this.bpTeam.knbbId) {
            this.bssTeam.knbbId = this.bpTeam.knbbId
            this.bssApi.updateVereniging(this.vereniging)
            .then(resp => {
                this.gaNaarSpelers();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            this.gaNaarSpelers();
        }
    }

    private gaNaarSpelers() {
        this.bpTeam.bssTeamId = this.bssTeam.teamId;
        localStorage.setItem('bpTeam', JSON.stringify(this.bpTeam));
        this.router.navigate(['onzestanden/spelers']);
    }

    opslaanClicked() {
        if (this.teamForm && this.teamForm.valid && this.modeTeam == 'add') {
            this.teamAanVerenigingEnCompetitieToevoegen();
            return;
        }
        if (!this.teamInComp) {
            this.voegTeamToeAanCompetitie();
        }
    }

    private teamAanVerenigingEnCompetitieToevoegen() {
        let team = new Team();
        team.verId = this.vereniging.verId;
        team.teamId = this.teamId?.value;
        team.knbbId = this.knbbId?.value;
        team.spelsoort = this.bpComp.spelsoortId;
        team.klasse = this.klasse?.value;
        team.volgNr = +this.volgNr?.value;
        team.naam = this.teamNaam?.value;
        if (team.knbbId != this.bpTeam.knbbId) {
            team.knbbId = this.bpTeam.knbbId;
        }

        this.vereniging.teams.push(team);
        this.bssApi.updateVereniging(this.vereniging)
        .then(resp => {
            this.bssTeam = team;
            this.teamAanCompetitieToevoegen();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private voegTeamToeAanCompetitie() {
        if (this.bssTeam.knbbId != this.bpTeam.knbbId) {
            this.bssTeam.knbbId = this.bpTeam.knbbId;
            this.bssApi.updateVereniging(this.vereniging)
            .then(resp => {
                this.teamAanCompetitieToevoegen();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            this.teamAanCompetitieToevoegen();
        }
    }

    private teamAanCompetitieToevoegen() {
        let compTeam = new KnbbCompTeam(this.bssTeam.verId, this.bssTeam.teamId);
        this.bssComp.teams.push(compTeam);
        this.bssApi.updateKnbbCompetitie(this.bssComp)
        .then(resp => {
            this.teamInBss = true;
            this.teamInComp = true;
            this.modeTeam = 'view';
            this.createTeamForm();
            this.bpTeam.bssVerId = this.bssTeam.verId;
            this.bpTeam.bssTeamId = this.bssTeam.teamId;
            localStorage.setItem('bpTeam', JSON.stringify(this.bpTeam));
            this.sectTitleTeam = 'BSS team';
            this.alert.showAlert('Team succesvol verwerkt in BSS.', 'success');
            this.escapeCount = 0;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    nieuwTeamClicked() {
        this.modeTeam = 'add';
        this.sectTitleTeam = 'BSS team toevoegen';
        this.bssTeam = new Team();
        this.createTeamForm(true);
        this.escapeCount++;
    }

    selectedTeamChanged() {
        this.bpTeam.bssTeamId = this.bssTeam.teamId;
    }

    @HostListener('document:keyup', ['$event'])
        handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (this.alert.helpVisible) {
            this.alert.hideHelp();
            return false;
        }        
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.key === 'Enter') {
            if (this.modeTeam == 'view') {
                if (this.teamInComp) {
                    this.buttonPressed(this.pageButtons[0]);
                }
                else {
                    this.buttonPressed(this.saveButtons[0]);
                }
                return false;
            }
            if (this.teamForm && this.teamForm.valid && this.teamIdOk) {
                this.buttonPressed(this.saveButtons[0]);
                return false;
            }
            return true;
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

        const team = localStorage.getItem('bpTeam');
        if (!team) {
            this.alert.showError('Geen team geselecteerd.');
            return;
        }
        this.bpTeam = JSON.parse(team);
        if (this.bpTeam.bssVerId == '') {
            this.alert.showError('Geen BSS vereniging geselecteerd voor dit team.');
            return;
        }
        
        const spelers = localStorage.getItem('bpSpelers');
        if (!spelers) {
            this.alert.showError('Geen team (spelers) geselecteerd.');
            return;
        }
        this.bpSpelers = JSON.parse(spelers);

        Promise.all([
            this.bssApi.getVereniging(this.bpTeam.bssVerId),
            this.bssApi.getKnbbCompetitie(this.bpComp.district.disId, this.bpComp.spelsoortId, this.bpComp.bssId)
        ])
        .then(results => {
            this.vereniging = results[0];
            this.bssComp = results[1];
            this.bssTeams = this.getBestaandeTeamsNotInComp(this.bssComp.klasse);
            this.findBssTeam(this.bpTeam.knbbId);
            if (this.bpTeam.bssTeamId == '') {
                if (this.bssTeams.length) {
                    this.bssTeam = this.bssTeams[0];
                    this.sectTitleTeam = 'BSS team selecteren of toevoegen';
                    this.bpTeam.bssTeamId = this.bssTeam.teamId;
                }
                else {
                    this.modeTeam = 'add';
                    this.createTeamForm(true);
                    this.sectTitleTeam = 'BSS team toevoegen';
                }
            }
            else {
                this.teamInBss = true;
                this.teamInComp = this.isTeamInComp(this.bssTeam);
                if (this.teamInComp) {
                    this.naarSpelersClicked();
                    return;
                }
                this.sectTitleTeam = 'BSS team aan competitie toevoegen';
                this.modeTeam = 'view';
                this.createTeamForm();
            }
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private isTeamInComp(bssTm: Team): boolean {
        return this.bssComp.teams.some(tm => tm.verId == bssTm.verId && tm.teamId == bssTm.teamId);
    }

    private findBssTeam(knbbId: string) {
        this.bssTeams.some(team => {
            if (team.knbbId == knbbId && !this.isTeamInComp(team)) {
                this.bssTeam = team;
                this.bpTeam.bssTeamId = this.bssTeam.teamId;
                return true;
            }
            else {
                return false;
            }
        })
    }

    private getBestaandeTeamsNotInComp(klasse: string): Team[] {
        let result: Team[] = [];
        this.vereniging.teams.forEach(team => {
            if (team.klasse == klasse && !this.isTeamInComp(team)) {
                result.push(team);
            }
        });
        return result;
    }

    private createTeamForm(forAdd?: boolean) {
        if (forAdd) {
            const idVolgNr = this.getTeamVolgnr(); 
            this.teamForm = this.fb.nonNullable.group({
                teamId: [this.bpComp.spelsoortId + '-' + this.bpComp.klasse + '-' + idVolgNr],
                knbbId: [this.bpTeam.knbbId, [Validators.required, notEmpty()]],
                klasse: [this.bpComp.klasse, [Validators.required, notEmpty()]],
                volgNr: [idVolgNr, [Validators.min(1)]],
                teamNaam: [this.bpTeam.naam, [Validators.required, notEmpty()]]
            });
            this.checkTeamId();
            this.volgNr?.valueChanges.subscribe(val => {
                this.teamId?.setValue(this.bpComp.spelsoortId + '-' + this.bpComp.klasse + '-' + val);
                this.checkTeamId();
            });
        }
        else {
            this.teamForm = this.fb.nonNullable.group({
                teamId: [this.bssTeam.teamId],
                knbbId: [this.bssTeam.knbbId],
                klasse: [this.bssTeam.klasse],
                volgNr: [this.bssTeam.volgNr],
                teamNaam: [this.bssTeam.naam, [Validators.required, notEmpty()]]
            });
        }
    }

    private getTeamVolgnr(): number {
        let result = 1;
        let idPrefix = this.bpComp.spelsoortId + '-' + this.bpComp.klasse + '-';
        if (this.vereniging.verId == '') {
            return result;
        }
        else {
            let resultOk = false;
            result = 0;
            while (!resultOk) {
                result++;
                const id = idPrefix + result;
                const exists = this.vereniging.teams.some(tm => tm.teamId == id);
                if (!exists) {
                    resultOk = true;
                }
            }
        }
        return result;
    }

    private checkTeamId() {
        this.teamIdOk = this.vereniging.teams.every(tm => tm.teamId != this.teamId?.value);
    }

    get teamId() {
        return this.teamForm?.get('teamId');
    }
    get knbbId() {
        return this.teamForm?.get('knbbId');
    }
    get klasse() {
        return this.teamForm?.get('klasse');
    }
    get volgNr() {
        return this.teamForm?.get('volgNr');
    }
    get teamNaam() {
        return this.teamForm?.get('teamNaam');
    }

}
