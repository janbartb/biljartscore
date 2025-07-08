import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { BpCompetitie, BpLokaliteit, BpTeam, TeamPageData, TeamPageSpeler } from '../../../model/bpoint';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { Button } from '../../../model/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates, notEmpty } from '../../../directives/validators.directive';
import { Lokaliteit } from '../../../model/vereniging';
import { NgClass } from '@angular/common';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-bp-lokaliteit',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './bp-lokaliteit.component.html',
    styleUrl: './bp-lokaliteit.component.css'
})
export class BpLokaliteitComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    bpComp: BpCompetitie = new BpCompetitie();
    bpTeam: BpTeam = new BpTeam();
    bpSpelers: TeamPageSpeler[] = [];
    bpLokaliteit: BpLokaliteit = new BpLokaliteit();
    bssLokaliteit: Lokaliteit = new Lokaliteit();
    existingLokIds: string[] = [];
    mode: string = 'view';
    sectTitle: string = 'in BSS';
    dataReady: boolean = false;

    saveButtons: Button[] = [new Button('Enter', 'Opslaan', true)];
    addButtons: Button[] = [new Button('Enter', 'Toevoegen aan BSS', true)];
    pageButtons: Button[] = [
        new Button('W', 'Wijzigen', true),
        new Button('Enter', 'Naar vereniging', true)
    ];

    lokForm!: FormGroup | null;

    override escapePressed(): void {
        if (this.mode != 'view') {
            this.lokForm?.reset();
            this.mode = 'view';
            this.sectTitle = 'in BSS';
            this.setEscapeCount();
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
            if (button.key == 'W') {
                this.wijzigenClicked();
            }
            else {
                if (this.mode == 'view') {
                    if (this.bssLokaliteit.lokId != '') {
                        this.naarTeamClicked();
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
            this.naarTeamClicked();
        }
    }

    toevoegenClicked() {
        this.createLokForm(true);
        this.mode = 'add';
        this.sectTitle = 'Toevoegen aan BSS';
        this.setEscapeCount()
    }

    wijzigenClicked() {
        this.createLokForm();
        this.mode = 'edit';
        this.sectTitle = 'Wijzigen in BSS';
        this.setEscapeCount()
    }

    naarTeamClicked() {
        this.bpTeam.bssLokId = this.bssLokaliteit.lokId;
        localStorage.setItem('bpTeam', JSON.stringify(this.bpTeam));
        this.router.navigate(['bpoint/vereniging']);
    }

    opslaanClicked() {
        if (!this.lokForm?.valid) {
            this.alert.showError('Het formulier is niet correct ingevuld.');
            return;
        }
        Object.assign(this.bssLokaliteit, this.lokForm?.value);
        if (this.mode == 'add') {
            this.lokaliteitToevoegen();
        }
        else {
            this.lokaliteitWijzigen();
        }
    }

    private lokaliteitToevoegen() {
        this.bssApi.addLokaliteit(this.bssLokaliteit)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.createLokForm();
            this.sectTitle = 'in BSS';
            this.mode = 'view';
            this.setEscapeCount();
        })
        .catch(err => {
            this.alert.showError(err);
        });    
    }

    private lokaliteitWijzigen() {
        this.bssApi.updateLokaliteit(this.bssLokaliteit)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.createLokForm();
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
                if (this.bssLokaliteit.lokId != '') {
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
            if (this.mode == 'view' && this.bssLokaliteit.lokId != '') {
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
        const team = localStorage.getItem('bpTeam');
        if (!team) {
            this.alert.showError('Geen team geselecteerd.');
            return;
        }
        this.bpTeam = JSON.parse(team);

        Promise.all([
            this.bssApi.getTeamFromBiljartpoint(this.bpTeam.knbbId, this.bpComp.knbbId, this.bpComp.poule, this.bpComp.district.knbbId),
            this.bssApi.getLokaliteiten()
        ])
        .then(results => {
            // verwerk html page data
            localStorage.setItem('bpSpelers', JSON.stringify(results[0].spelers));
            this.bpLokaliteit = this.createBpLokaliteit(results[0].lokData);
            // verwerk lokaliteiten
            this.existingLokIds = results[1].map(lok => lok.lokId);
            const foundBssLok = results[1].find(lok => lok.knbbId == this.bpLokaliteit.knbbId);
            if (foundBssLok) {
                this.bssLokaliteit = foundBssLok;
                if (this.bssLokEqualsBpLok()) {
                    this.naarTeamClicked();
                    return;
                }
                this.createLokForm();
            }
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private bssLokEqualsBpLok(): boolean {
        return this.bpLokaliteit.knbbId == this.bssLokaliteit.knbbId &&
                this.bpLokaliteit.naam == this.bssLokaliteit.naam &&
                this.bpLokaliteit.adres == this.bssLokaliteit.adres &&
                this.bpLokaliteit.postcode == this.bssLokaliteit.postcode &&
                this.bpLokaliteit.plaats == this.bssLokaliteit.plaats &&
                this.bpLokaliteit.telefoon == this.bssLokaliteit.telefoon &&
                this.bpLokaliteit.email == this.bssLokaliteit.email;
    }

    private createBpLokaliteit(lok: string): BpLokaliteit {
        let result: BpLokaliteit = new BpLokaliteit();
        const lokdat = lok.replaceAll('\t', '');
        const lokdatArr = lokdat.split('\n');
        const pos = lokdatArr[0].indexOf(' ');
        result.knbbId = lokdatArr[0].substring(0, pos);
        result.naam = lokdatArr[0].substring(pos + 1);
        result.adres = lokdatArr[2].trim() + ' ' + lokdatArr[3].trim();
        result.postcode = lokdatArr[4].trim();
        let plaats = lokdatArr[5].toLowerCase().trim();
        result.plaats = plaats.substring(0, 1).toUpperCase() + plaats.substring(1);
        if (lokdatArr.length > 6) {
            result.telefoon = lokdatArr[6].trim();
        }
        if (lokdatArr.length > 7) {
            result.email = lokdatArr[7].trim();
        }
        return result;
    }

    private setEscapeCount() {
        this.escapeCount = (this.mode == 'view') ? 0 : 1;
    }

    private createLokForm(forAdd?: boolean) {
        if (forAdd) {
            this.lokForm = this.fb.nonNullable.group({
                lokId: [this.createLokaliteitId(this.bpLokaliteit.naam), [Validators.required, notEmpty(), noDuplicates(this.existingLokIds)]],
                knbbId: [this.bpLokaliteit.knbbId, [Validators.required, notEmpty()]],
                naam: [this.bpLokaliteit.naam, [Validators.required, notEmpty()]],
                adres: [this.bpLokaliteit.adres],
                postcode: [this.bpLokaliteit.postcode],
                plaats: [this.bpLokaliteit.plaats],
                telefoon: [this.bpLokaliteit.telefoon],
                email: [this.bpLokaliteit.email]
            });
        }
        else {
            this.lokForm = this.fb.nonNullable.group({
                lokId: [this.bssLokaliteit.lokId],
                knbbId: [this.bssLokaliteit.knbbId, [Validators.required, notEmpty()]],
                naam: [this.bssLokaliteit.naam, [Validators.required, notEmpty()]],
                adres: [this.bssLokaliteit.adres],
                postcode: [this.bssLokaliteit.postcode],
                plaats: [this.bssLokaliteit.plaats],
                telefoon: [this.bssLokaliteit.telefoon],
                email: [this.bssLokaliteit.email]
            });
        }
    }

    private createLokaliteitId(naam: string): string {
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
            resultOk = !this.existingLokIds.some(id => id == resultId);
            if (!resultOk) {
                cnt++;
                resultId = prefixId + cnt;
            }
        }
        return resultId;
    }

    get lokId() {
        return this.lokForm?.get('lokId');
    }
    get knbbId() {
        return this.lokForm?.get('knbbId');
    }
    get naam() {
        return this.lokForm?.get('naam');
    }
    get adres() {
        return this.lokForm?.get('adres');
    }
    get postcode() {
        return this.lokForm?.get('postcode');
    }
    get plaats() {
        return this.lokForm?.get('plaats');
    }
    get telefoon() {
        return this.lokForm?.get('telefoon');
    }
    get email() {
        return this.lokForm?.get('email');
    }

}
