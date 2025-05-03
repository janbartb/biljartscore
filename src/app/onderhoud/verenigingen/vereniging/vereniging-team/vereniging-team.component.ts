import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Team, Vereniging } from '../../../../model/vereniging';
import { List } from '../../../../model/list';
import { SpelerSelectie, SpelerWrapper } from '../../../../model/speler';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { Button } from '../../../../model/button';
import { DecimalPipe, NgClass } from '@angular/common';
import { notEmpty } from '../../../../directives/validators.directive';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';
import { HelperService } from '../../../../services/helper.service';
import { Scrolling } from '../../../../model/scrolling';
import { KnbbCompetitie } from '../../../../model/knbb-competitie';

@Component({
    selector: 'app-vereniging-team',
    standalone: true,
    imports: [
        PageHeaderComponent, 
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule, 
        DecimalPipe,
        NgClass
    ],
    templateUrl: './vereniging-team.component.html',
    styleUrl: './vereniging-team.component.css'
})
export class VerenigingTeamComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);
    helper = inject(HelperService);

    vereniging: Vereniging = new Vereniging();
    team: Team = new Team();
    teamChanged: boolean = false;
    ledenLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    selectieLijst: List<SpelerSelectie> = new List<SpelerSelectie>();
    klassen: string[] = [];
    existingIds: string[] = [];
    compKnbbId: string = '';
    compPoule: string = '';
    biljartPointLink: string = '';
    aantalLeden: number = 0;
    activeSection: number = 0;
    mode: string = 'edit';
    subtitle: string = 'Vereniging';
    teamTitle: string = '';
    createdId: string = '';
    duplicateId: boolean = false;
    spelNaam: string = this.appData.getSpelNaam();
    scrollElm!: HTMLDivElement;
    ledenScroll!: Scrolling;

    buttons: Button[] = [
        new Button('Ctrl+Enter', 'Opslaan', true),
        new Button('Enter', 'Voeg toe aan team', true),
        new Button('Enter', 'Verwijder uit team', true)
    ];

    htmlSelectKlasse = viewChild<ElementRef<HTMLSelectElement>>('klasse');
    htmlInputKnbbId = viewChild<ElementRef<HTMLInputElement>>('knbbid');
    htmlLedenLijst = viewChild<ElementRef<HTMLDivElement>>('ledenlijst');

    teamForm!: FormGroup;

    constructor() {
        super();
        effect(() => {
            this.htmlInputKnbbId()?.nativeElement.focus();
            this.htmlSelectKlasse()?.nativeElement.focus();
        });
    }

    buttonPressed() {
        if (this.selectieLijst.hoveredIdx >= 0 && this.activeSection == 1) {
            const btnIdx = this.selectieLijst.filtered[this.selectieLijst.hoveredIdx].spelerSelected ? 2 : 1;
            this.buttons[btnIdx].selected = true;
            setTimeout(() => {
                this.buttons[btnIdx].selected = false;
                this.spelerSelectieClicked(this.selectieLijst.hoveredIdx);
            }, 300);
            return;
        }
    }

    enterPressed() {
        this.buttons[0].selected = true;
        setTimeout(() => {
            this.buttons[0].selected = false;
            this.opslaanClicked();
        }, 300);
    }

    override escapePressed(): void {
        if (this.teamChanged) {
            this.teamForm.reset();
            this.fillSelectieLijst();
            this.teamChanged = false;
            this.setEscapeCount();
            return;
        }
        super.escapePressed();
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.opslaanClicked();
        }
        else {
            if (this.selectieLijst.hoveredIdx >= 0 && this.activeSection == 1) {
                this.spelerSelectieClicked(this.selectieLijst.hoveredIdx);
            }
        }
    }

    spelerSelectieClicked(idx: number) {
        let spelerClicked = this.selectieLijst.getItem(idx);
        if (spelerClicked) {
            spelerClicked.spelerSelected = !spelerClicked.spelerSelected;
            this.sortSelectie();
            this.aantalLeden += spelerClicked.spelerSelected ? 1 : -1;
            this.selectieLijst.hoveredIdx = -1;
            this.ledenScroll.scrollToTop();
            this.teamChanged = this.hasTeamChanged();
            this.setEscapeCount();
        }
    }

    opslaanClicked() {
        if (!this.teamForm || !this.teamForm.valid || this.duplicateId) {
            return;
        }
        Object.assign(this.team, this.teamForm.value);
        if (this.mode == 'add') {
            this.team.verId = this.vereniging.verId;
            this.team.teamId = this.createdId;
            this.team.spelsoort = this.spelId;
        }
        this.team.teamLeden = this.selectieLijst.filtered.filter(lid => lid.spelerSelected).map(lid => lid.spelerId);
        if (this.mode == 'add') {
            this.vereniging.teams.push(this.team);
        }
        else {
            const idx = this.vereniging.teams.findIndex(tm => tm.teamId == this.team.teamId);
            if (idx < 0) {
                this.alert.showError(`Kan team niet opslaan. Team '${this.team.teamId}' niet gevonden in vereniging.`);
                return;
            }
            this.vereniging.teams[idx] = this.team;
        }
        this.bssApi.updateVereniging(this.vereniging)
            .then(resp => {
                const action = this.mode == 'add' ? 'toegevoegd' : 'gewijzigd';
                this.alert.showAlert(`Team '${this.team.naam}' is ${action}.`, 'success');
            })
            .catch(err => {
                this.alert.showError(err);
            });
        super.escapePressed();
    }

    generateTeamId() {
        this.createdId = this.spelId;
        if (this.klasse?.value != '') {
            this.createdId += '-' + this.klasse?.value;
        }
        if (this.volgNr?.value > 0) {
            this.createdId += '-' + this.volgNr?.value;
        }
        this.duplicateId = this.existingIds.some(id => id == this.createdId);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent): boolean {
        if (this.activeSection == 1) {
            if ((event.key === 'Enter' || event.key.startsWith('Arrow')) && 
                        (event.target instanceof HTMLSelectElement || event.target instanceof HTMLAnchorElement)) {
                event.preventDefault();
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
            }
        }
        return true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUpEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        const fromInput = event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            if (!fromInput || event.ctrlKey || this.activeSection == 1) {
                this.activeSection = this.activeSection == 0 ? 1 : 0;
                return false;
            }
            return true;
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (this.activeSection == 1) {
                if (event.key === 'ArrowUp') {
                    this.selectieLijst.hoverPreviousItem();
                    this.ledenScroll.scrollUp(this.selectieLijst.hoveredIdx);
                }
                if (event.key === 'ArrowDown') {
                    this.selectieLijst.hoverNextItem();
                    this.ledenScroll.scrollDown(this.selectieLijst.hoveredIdx);
                }
                return false;    
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.enterPressed();
            }
            else {
                this.buttonPressed();
            }
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
        const verId: string | null = this.route.snapshot.paramMap.get('verId');
        if (!verId) {
            this.alert.showError('Het vereniging ID in de URL is undefined.');
            return;
        }
        const teamId: string | null = this.route.snapshot.paramMap.get('teamId');
        if (!teamId) {
            this.alert.showError('Het team ID in de URL is undefined.');
            return;
        }
        this.teamTitle = 'Team ' + (teamId == 'toevoegen' ? 'toevoegen' : `'${teamId}' wijzigen`);
        this.team.spelsoort = this.spelId;

        Promise.all([
            this.bssApi.getVereniging(verId),
            this.bssApi.getLedenVanVereniging(verId, this.spelId),
            this.bssApi.getMoyenneKlassenLijst(this.spelId),
            this.bssApi.getKnbbCompetities(this.appData.getDistrict().disId, this.spelId)
        ])
            .then(results => {
                this.klassen = results[2];
                this.sortKlassen();
                this.vereniging = results[0];
                this.subtitle = `Vereniging ${this.vereniging.naam}`;
                if (teamId == 'toevoegen') {
                    this.mode = 'add';
                    this.teamChanged = true;
                    this.teamTitle = 'Team toevoegen';
                    this.createdId = this.spelId;
                    this.existingIds = this.vereniging.teams
                        .filter(tm => tm.spelsoort == this.spelId)
                        .map(x => x.teamId);
                }
                else {
                    let team = this.vereniging.teams.find(team => team.teamId == teamId);
                    if (!team) {
                        this.alert.showError(`Team '${teamId}' niet gevonden in vereniging '${verId}'`);
                        return;
                    }
                    this.team = team;
                    this.teamTitle = `Team '${this.team.naam}' wijzigen`;
                    this.createdId = this.team.teamId;
                    this.fillCompKnbbIdAndPoule(results[3]);
                }
                this.aantalLeden = this.team.teamLeden.length;
                this.ledenLijst.fillItems(results[1]);
                this.sortLeden();
                this.fillSelectieLijst();
                this.subtitle = `Vereniging '${this.vereniging.naam}'`;
                this.createTeamForm();

                const elm = this.htmlLedenLijst()?.nativeElement;
                if (elm) {
                    this.scrollElm = elm;
                    new ResizeObserver(() => { 
                        this.initSelectieLijstScrolling(this.scrollElm);
                    }).observe(elm);
                }
            })
            .catch((err) => {
                this.alert.showError(err);
            });
    }

    private fillCompKnbbIdAndPoule(comps: KnbbCompetitie[]): void {
        const foundComp = comps.find(comp => {
            return comp.klasse == this.team.klasse && comp.teams.some(tm => tm.verId == this.team.verId && tm.teamId == this.team.teamId);
        });
        if (foundComp) {
            this.compKnbbId = foundComp.knbbId;
            if (foundComp.poule > 0) {
                this.compPoule = '' + foundComp.poule;
            }
        }
    }

    private createBiljartpointLink() {
        this.biljartPointLink = '';
        const compId = this.compKnbbId;
        const teamId = this.knbbId?.value;
        const poule = this.compPoule;
        const distrId = this.appData.getDistrict().knbbId;
        if (compId == '' || !teamId || teamId == '' || poule == '' || distrId == '') {
            return;
        }
        this.biljartPointLink = `https://biljartpoint.nl/index.php?page=teamdetail&team_id=${teamId}&compid=${compId}&poule=${poule}&district=${distrId}`;
    }

    private initSelectieLijstScrolling(elm: HTMLDivElement) {
        if (elm) {
            if (this.selectieLijst.hoveredIdx >= 0) {
                this.selectieLijst.hoveredIdx = 0;
            }
            this.ledenScroll = new Scrolling(elm, elm.offsetHeight, this.selectieLijst.filtered.length);
        }
    }

    private fillSelectieLijst() {
        let tempList: SpelerSelectie[] = [];
        this.ledenLijst.filtered.forEach(sw => {
            let splSel = new SpelerSelectie();
            splSel.spelerId = sw.speler.id;
            splSel.spelerNaam = sw.getNaam();
            splSel.spelerMoy = sw.getGemiddeldeVanSpel();
            splSel.spelerSelected = this.team.teamLeden.some(teamLid => teamLid == sw.speler.id);
            tempList.push(splSel);
        });
        this.selectieLijst.fillItems(tempList);
        this.sortSelectie();
    }

    private createTeamForm() {
        this.teamForm = this.fb.nonNullable.group({
            teamId: [this.team.teamId],
            knbbId: [this.team.knbbId],
            spelsoort: [this.team.spelsoort],
            klasse: [this.team.klasse],
            volgNr: [this.team.volgNr, [Validators.min(1)]],
            naam: [this.team.naam, [Validators.required, notEmpty()]]
        });
        this.teamId?.disable();
        this.spelsoort?.disable();
        if (this.mode == 'edit') {
            this.klasse?.disable();
            this.volgNr?.disable();
            this.knbbId?.valueChanges.subscribe(val => {
                this.createBiljartpointLink();
                this.teamChanged = this.hasTeamChanged();
                this.setEscapeCount();
            });
            this.naam?.valueChanges.subscribe(val => {
                this.teamChanged = this.hasTeamChanged();
                this.setEscapeCount();
            });

        }
        else {
            this.teamId?.setValue(this.createdId);
            this.spelsoort?.setValue(this.spelId);
            this.klasse?.valueChanges.subscribe(val => {
                this.generateTeamId();
            });
            this.volgNr?.valueChanges.subscribe(val => {
                this.generateTeamId();
            });
        }
        this.createBiljartpointLink();
    }

    private hasTeamChanged(): boolean {
        if (this.mode == 'add') {
            return true;
        }
        if (this.team.knbbId != this.knbbId?.value || this.team.naam != this.naam?.value) {
            return true;
        }
        const selected = this.selectieLijst.filtered.filter(spl => spl.spelerSelected);
        if (selected.length != this.team.teamLeden.length) {
            return true;
        }
        return !selected.every(spl => {
            return this.team.teamLeden.some(lidId => lidId == spl.spelerId);
        });
    }

    private setEscapeCount() {
        this.escapeCount = this.teamChanged ? 1 : 0;
    }

    private sortKlassen() {
        this.klassen.sort((a, b) => {
            return (a > b) ? 1 : -1;
        });
    }

    private sortLeden() {
        this.ledenLijst.filtered.sort((a: SpelerWrapper, b: SpelerWrapper) => {
            return b.getGemiddeldeVanSpel() - a.getGemiddeldeVanSpel();
        });
    }

    private sortSelectie() {
        this.selectieLijst.filtered.sort((a: SpelerSelectie, b: SpelerSelectie) => {
            if ((a.spelerSelected != b.spelerSelected)) {
                return a.spelerSelected ? -1 : 1;
            }
            else {
                return b.spelerMoy - a.spelerMoy;
            }
        });
    }

    get teamId() {
        return this.teamForm.get('teamId');
    }
    get knbbId() {
        return this.teamForm.get('knbbId');
    }
    get spelsoort() {
        return this.teamForm.get('spelsoort');
    }
    get klasse() {
        return this.teamForm.get('klasse');
    }
    get volgNr() {
        return this.teamForm.get('volgNr');
    }
    get naam() {
        return this.teamForm.get('naam');
    }

}
