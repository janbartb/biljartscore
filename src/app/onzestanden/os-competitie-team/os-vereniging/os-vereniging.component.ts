import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BpCompetitie, BpTeam, TeamPageSpeler } from '../../../model/bpoint';
import { KnbbCompetitie } from '../../../model/knbb-competitie';
import { Lokaliteit, Team, Vereniging } from '../../../model/vereniging';
import { Button } from '../../../model/button';
import { noDuplicates, notEmpty } from '../../../directives/validators.directive';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { HelpComponent } from '../../../shared/help/help.component';
import { NgClass } from '@angular/common';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';

@Component({
    selector: 'app-os-vereniging',
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
    templateUrl: './os-vereniging.component.html',
    styleUrl: './os-vereniging.component.css'
})
export class OsVerenigingComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    bpComp: BpCompetitie = new BpCompetitie();
    bssComp: KnbbCompetitie = new KnbbCompetitie();
    bpTeam: BpTeam = new BpTeam();
    bssTeam: Team = new Team();
    bpSpelers: TeamPageSpeler[] = [];
    vereniging: Vereniging = new Vereniging();
    verenigingen: Vereniging[] = [];
    existingVerIds: string[] = [];
    lokaliteit: Lokaliteit = new Lokaliteit();
    sectTitleVer: string = 'BSS vereniging';
    modeVer: string = 'view';
    teamInBss: boolean = false;
    teamInComp: boolean = false;
    status: string = 'loading';

    verButton: Button = new Button('', 'Nieuwe vereniging', false);
    saveButtons: Button[] = [new Button('Enter', 'Opslaan', true)];
    pageButtons: Button[] = [
        new Button('Enter', 'Naar team', true)
    ];

    verenigingForm!: FormGroup | null;

    override escapePressed(): void {
        if (this.escapeCount > 0) {
            if (this.verenigingen.length > 0) {
                this.vereniging = this.verenigingen[0];
                if (this.bpTeam.bssVerId != '') {
                    const idx = this.verenigingen.findIndex(ver => ver.verId == this.bpTeam.bssVerId);
                    if (idx >= 0) {
                        this.vereniging = this.verenigingen[idx];
                    }
                }
                this.modeVer = 'view';
                this.verenigingForm = null;
            }
            this.escapeCount = 0;
            return;
        }
        this.router.navigate(['onzestanden/compteams']);
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
                this.naarTeamClicked();
            }
        }, 300);
    }

    naarSpelersClicked() {
        this.router.navigate(['onzestanden/spelers']);
    }

    naarTeamClicked() {
        if (this.vereniging.verId != '') {
            this.bpTeam.bssVerId = this.vereniging.verId;
            localStorage.setItem('bpTeam', JSON.stringify(this.bpTeam));
            this.router.navigate(['onzestanden/team']);
        }
    }

    opslaanClicked() {
        if (this.verenigingForm && this.modeVer == 'add') {
            this.verenigingToevoegenEnNaarTeam();
            return;
        }
    }

    private verenigingToevoegenEnNaarTeam() {
        let vereniging = new Vereniging();
        vereniging.verId = this.verId?.value;
        vereniging.naam = this.verNaam?.value;
        vereniging.locatie = this.lokId?.value;
        vereniging.korteNaam = this.korteNaam?.value;

        this.bssApi.addVereniging(vereniging)
        .then(resp => {
            this.vereniging = vereniging;
            this.bpTeam.bssVerId = this.vereniging.verId;
            this.naarTeamClicked();
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
        this.escapeCount++;
    }

    verenigingChanged() {
        this.bpTeam.bssVerId = this.vereniging.verId;
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
            if (this.verenigingForm) {
                if (this.verenigingForm.valid) {
                    this.buttonPressed(this.saveButtons[0]);
                    return false;
                }
            }
            else {
                this.buttonPressed(this.pageButtons[0]);
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
        
        Promise.all([
            this.bssApi.getVerenigingen(),
            //this.bssApi.getLokaliteit(this.bpTeam.bssLokId),
            this.bssApi.getKnbbCompetitie(this.bpComp.district.disId, this.bpComp.spelsoortId, this.bpComp.bssId),
            this.bssApi.getTeamFromOnzestanden(this.bpTeam.knbbId, this.bpComp.osOrg, this.bpComp.osComp)
        ])
        .then(results => {
            //this.lokaliteit = results[1];
            this.bssComp = results[1];
            localStorage.setItem('bpSpelers', JSON.stringify(results[2].spelers));
            this.existingVerIds = results[0].map(ver => ver.verId);
            this.findBssTeamAndVereniging(this.bpTeam.knbbId, results[0]);
            if (this.vereniging.verId == '') {
                //this.verenigingen = results[0].filter(ver => ver.locatie == this.lokaliteit.lokId);
                this.verenigingen = results[0];
                if (this.verenigingen.length) {
                    if (this.verenigingen.length > 1) {
                        const dummyVer = new Vereniging();
                        dummyVer.naam = '---';
                        this.verenigingen.unshift(dummyVer);
                    }
                    this.vereniging = this.verenigingen[0];
                    this.sectTitleVer = 'BSS vereniging selecteren of toevoegen';
                    if (this.bpTeam.bssVerId != '') {
                        const idx = this.verenigingen.findIndex(ver => ver.verId == this.bpTeam.bssVerId);
                        if (idx >= 0) {
                            this.vereniging = this.verenigingen[idx];
                            if (this.verenigingen.length > 2) {
                                this.verenigingen.splice(0, 1);
                            }
                        }
                    }
                    this.bpTeam.bssVerId = this.vereniging.verId;
                }
                else {
                    this.modeVer = 'add';
                    this.createVerenigingForm(true);
                    this.sectTitleVer = 'BSS vereniging toevoegen';
                }
            }
            else {
                this.teamInBss = true;
                this.teamInComp = this.bssComp.teams.some(tm => tm.verId == this.bssTeam.verId && tm.teamId == this.bssTeam.teamId);
                if (this.teamInComp) {
                    this.naarSpelersClicked();
                }
                else {
                    this.naarTeamClicked();
                }
                return;
            }
            this.status = 'success';
        })
        .catch(err => {
            this.status = 'error';
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
                //lokId: [this.bpTeam.bssLokId, [Validators.required, notEmpty()]],
                lokId: [this.bpTeam.bssLokId],
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

}
