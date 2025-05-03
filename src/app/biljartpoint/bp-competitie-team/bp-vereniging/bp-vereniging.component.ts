import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { BaseComponent } from '../../../base/base.component';
import { BpCompetitie, BpTeam, TeamPageSpeler } from '../../../model/bpoint';
import { Lokaliteit, Team, Vereniging } from '../../../model/vereniging';
import { KnbbCompetitie, KnbbCompTeam } from '../../../model/knbb-competitie';
import { Button } from '../../../model/button';
import { noDuplicates, notEmpty } from '../../../directives/validators.directive';
import { ButtonComponent } from "../../../shared/button-group/button/button.component";

@Component({
    selector: 'app-bp-vereniging',
    standalone: true,
    imports: [
    PageHeaderComponent,
    SectionHeaderComponent,
    SectionFooterBtnsComponent,
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    ButtonComponent
],
    templateUrl: './bp-vereniging.component.html',
    styleUrl: './bp-vereniging.component.css'
})
export class BpVerenigingComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    bpComp: BpCompetitie = new BpCompetitie();
    bssComp: KnbbCompetitie = new KnbbCompetitie();
    bpTeam: BpTeam = new BpTeam();
    bssTeam: Team = new Team();
    bpSpelers: TeamPageSpeler[] = [];
    vereniging: Vereniging = new Vereniging();
    verenigingen: Vereniging[] = [];
    existingVerIds: string[] = [];
    existingTeamIds: string[] = [];
    lokaliteit: Lokaliteit = new Lokaliteit();
    sectTitleVer: string = 'BSS vereniging';
    sectTitleTeam: string = 'BSS team';
    modeVer: string = 'view';
    modeTeam: string = 'view';
    teamInBss: boolean = false;
    teamInComp: boolean = false;
    teamIdOk: boolean = false;
    dataReady: boolean = false;

    verButton: Button = new Button('', 'Nieuwe vereniging', false);
    saveButtons: Button[] = [new Button('Enter', 'Opslaan', true)];
    pageButtons: Button[] = [
        new Button('Enter', 'Naar spelers', true)
    ];

    verenigingForm!: FormGroup | null;
    teamForm!: FormGroup | null;

    override escapePressed(): void {
        if (this.escapeCount > 0) {
            if (this.verenigingen.length > 0) {
                this.vereniging = this.verenigingen[0];
                this.modeVer = 'view';
                this.verenigingForm = null;
                this.createTeamForm(true);
            }
            this.escapeCount = 0;
            return;
        }
        this.router.navigate(['bpoint/compteams']);
    }

    override previousPressed(): void {
        this.router.navigate(['bpoint/compteams']);
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
        this.router.navigate(['bpoint/spelers']);
    }

    opslaanClicked() {
        if (this.verenigingForm && this.modeVer == 'add') {
            this.verenigingEnTeamToevoegen();
            return;
        }
        if (this.teamForm && this.modeTeam == 'add') {
            this.teamAanVerenigingToevoegen();
            return;
        }
        if (!this.teamInComp) {
            this.teamAanCompetitieToevoegen();
        }
    }

    private verenigingEnTeamToevoegen() {
        let vereniging = new Vereniging();
        vereniging.verId = this.verId?.value;
        vereniging.naam = this.verNaam?.value;
        vereniging.locatie = this.lokId?.value;
        vereniging.korteNaam = this.korteNaam?.value;
        let team = new Team();
        team.verId = vereniging.verId;
        team.teamId = this.teamId?.value;
        team.knbbId = this.knbbId?.value;
        team.spelsoort = this.bpComp.spelsoortId;
        team.klasse = this.klasse?.value;
        team.volgNr = +this.volgNr?.value;
        team.naam = this.teamNaam?.value;

        vereniging.teams.push(team);
        this.bssApi.addVereniging(vereniging)
        .then(resp => {
            this.vereniging = vereniging;
            this.bssTeam = team;
            this.teamAanCompetitieToevoegen();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private teamAanVerenigingToevoegen() {
        let team = new Team();
        team.verId = this.vereniging.verId;
        team.teamId = this.teamId?.value;
        team.knbbId = this.knbbId?.value;
        team.spelsoort = this.bpComp.spelsoortId;
        team.klasse = this.klasse?.value;
        team.volgNr = +this.volgNr?.value;
        team.naam = this.teamNaam?.value;

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

    private teamAanCompetitieToevoegen() {
        let compTeam = new KnbbCompTeam(this.bssTeam.verId, this.bssTeam.teamId);
        this.bssComp.teams.push(compTeam);
        this.bssApi.updateKnbbCompetitie(this.bssComp)
        .then(resp => {
            this.teamInBss = true;
            this.teamInComp = true;
            this.verenigingen = [];
            this.modeTeam = 'view';
            this.modeVer = 'view';
            this.createVerenigingForm();
            this.createTeamForm();
            this.bpTeam.bssVerId = this.bssTeam.verId;
            this.bpTeam.bssTeamId = this.bssTeam.teamId;
            localStorage.setItem('bpTeam', JSON.stringify(this.bpTeam));
            this.sectTitleVer = 'BSS vereniging';
            this.sectTitleTeam = 'BSS team';
            this.alert.showAlert('Vereniging en team succesvol verwerkt in BSS.', 'success');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    nieuweVerenigingClicked() {
        this.modeVer = 'add';
        this.sectTitleVer = 'BSS vereniging toevoegen';
        this.vereniging = new Vereniging();
        this.createVerenigingForm(true);
        this.createTeamForm(true);
        this.escapeCount++;
    }

    verenigingChanged() {
        this.createTeamForm(true);
    }

    @HostListener('document:keyup', ['$event'])
        handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
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
            if ((!this.verenigingForm || this.verenigingForm.valid) && this.teamForm && this.teamForm.valid && this.teamIdOk) {
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
        const spelers = localStorage.getItem('bpSpelers');
        if (!spelers) {
            this.alert.showError('Geen team (spelers) geselecteerd.');
            return;
        }
        this.bpSpelers = JSON.parse(spelers);
        
        Promise.all([
            this.bssApi.getVerenigingen(),
            this.bssApi.getLokaliteit(this.bpTeam.bssLokId),
            this.bssApi.getKnbbCompetitie(this.bpComp.district.disId, this.bpComp.spelsoortId, this.bpComp.bssId)
        ])
        .then(results => {
            this.lokaliteit = results[1];
            this.bssComp = results[2];
            this.existingVerIds = results[0].map(ver => ver.verId);
            this.findBssTeamAndVereniging(this.bpTeam.knbbId, results[0]);
            if (this.vereniging.verId == '') {
                this.verenigingen = results[0].filter(ver => ver.locatie == this.lokaliteit.lokId);
                if (this.verenigingen.length) {
                    this.vereniging = this.verenigingen[0];
                    this.sectTitleVer = 'BSS vereniging selecteren';
                }
                else {
                    this.modeVer = 'add';
                    this.createVerenigingForm(true);
                    this.sectTitleVer = 'BSS vereniging toevoegen';
                }
                this.modeTeam = 'add';
                this.createTeamForm(true);
                this.sectTitleTeam = 'BSS team toevoegen';
            }
            else {
                this.teamInBss = true;
                this.teamInComp = this.bssComp.teams.some(tm => tm.verId == this.bssTeam.verId && tm.teamId == this.bssTeam.teamId);
                if (!this.teamInComp) {
                    this.sectTitleTeam = 'BSS team toevoegen';
                }
                if (this.teamInBss && this.teamInComp) {
                    this.naarSpelersClicked();
                    return;
                }
                this.createVerenigingForm();
                this.createTeamForm();
            }
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private findBssTeamAndVereniging(knbbId: string, verenigingen: Vereniging[]) {
        verenigingen.some(ver => {
            let idxTeam = ver.teams.findIndex(tm => tm.knbbId == knbbId);
            if (idxTeam < 0) {
                return false;
            }
            else {
                this.bssTeam = ver.teams[idxTeam];
                this.vereniging = ver;
                return true;
            }
        })
    }

    private createVerenigingForm(forAdd?: boolean) {
        if (forAdd) {
            this.verenigingForm = this.fb.nonNullable.group({
                verId: [this.createVerenigingId(this.bpTeam.naam), [Validators.required, notEmpty(), noDuplicates(this.existingVerIds)]],
                verNaam: [this.bpTeam.naam, [Validators.required, notEmpty()]],
                lokId: [this.bpTeam.bssLokId, [Validators.required, notEmpty()]],
                korteNaam: ['', [Validators.required, notEmpty()]]
            });
        }
        else {
            this.verenigingForm = this.fb.nonNullable.group({
                verId: [this.vereniging.verId],
                verNaam: [this.vereniging.naam, [Validators.required, notEmpty()]],
                lokId: [this.vereniging.locatie],
                korteNaam: [this.vereniging.korteNaam, [Validators.required, notEmpty()]]
            });
        }
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

    private createVerenigingId(naam: string): string {
        if (naam == '') {
            return '';
        }
        const words = naam.split(' ');
        let resultId = '';
        words.forEach(word => {
            if (word.trim().length > 0) {
                const char = word.trim().charAt(0).toLowerCase();
                if (char != "'" && char != '`') {
                    resultId += char;
                }
            }
        });
        let cnt = 1;
        let prefixId = resultId;
        let resultOk = false;
        while (!resultOk) {
            resultOk = !this.existingVerIds.some(id => id == resultId);
            if (!resultOk) {
                cnt++;
                resultId = prefixId + cnt;
            }
        }
        return resultId;
    }

    get verId() {
        return this.verenigingForm?.get('verId');
    }
    get verNaam() {
        return this.verenigingForm?.get('verNaam');
    }
    get lokId() {
        return this.verenigingForm?.get('lokId');
    }
    get korteNaam() {
        return this.verenigingForm?.get('korteNaam');
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
