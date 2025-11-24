import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../base/base.component';
import { Lokaliteit, Team, Vereniging } from '../../../model/vereniging';
import { List } from '../../../model/list';
import { SpelerWrapper } from '../../../model/speler';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { Button } from '../../../model/button';
import { SectionFooterBtnsComponent } from "../../../shared/section-footer-btns/section-footer-btns.component";
import { KnbbCompetitie } from '../../../model/knbb-competitie';
import { ConfirmComponent } from '../../../shared/confirm/confirm.component';
import { Alinea, ConfirmDialog } from '../../../model/dialogs';
import { TabsComponent } from '../../../shared/tabs/tabs.component';
import { VerenigingEditComponent } from './vereniging-edit/vereniging-edit.component';
import { VerenigingViewComponent } from './vereniging-view/vereniging-view.component';

interface TeamItem {
    team: Team;
    inComps: string[];
}

interface LidItem {
    lid: SpelerWrapper;
    inTeams: string[];
}

@Component({
    selector: 'app-vereniging',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        TabsComponent,
        VerenigingViewComponent,
        VerenigingEditComponent,
        ConfirmComponent,
        NgClass,
        DecimalPipe,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './vereniging.component.html',
    styleUrl: './vereniging.component.css'
})
export class VerenigingComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);

    subtitle: string = "Vereniging"
    tabs: string[] = ['Vereniging', 'Teams', 'Leden'];
    vereniging: Vereniging = new Vereniging();
    verLokaliteit: Lokaliteit = new Lokaliteit();
    teamLijst: List<TeamItem> = new List<TeamItem>();
    ledenLijst: List<LidItem> = new List<LidItem>();
    comps: KnbbCompetitie[] = [];
    lokaliteiten: Lokaliteit[] = [];
    idxTab: number = 0;
    idxToDelete: number = -1;
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    editVer: boolean = false;

    wijzigButtons: Button[] = [new Button('W', 'Wijzigen', true)];
    ledenButtons: Button[] = [new Button('L', 'Wijzigen', true)];
    teamButtons = [
        new Button('+', 'Team', true), 
        new Button('Enter', 'Selecteer', true), 
        new Button('Del', 'Team', true)
    ];

    buttonPressed(event: any, button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'W') {
                this.verenigingWijzigenClicked();
            }
            else if (button.key == 'Enter') {
                this.teamSelecterenClicked(this.teamLijst.hoveredIdx);
            }
            else if (button.key == '+') {
                this.teamToevoegenClicked();
            }
            else if (button.key == 'L') {
                this.ledenWijzigenClicked();
            }
            else if (button.key == 'Del') {
                this.teamVerwijderenClicked(event, this.teamLijst.hoveredIdx);
            }
        }, 300);
    }

    teamButtonClicked(idx: number) {
        if (idx == 0) {
            this.teamToevoegenClicked();
        }
        else if (idx == 1) {
            this.teamSelecterenClicked(this.teamLijst.hoveredIdx);
        }
        else if (idx == 2) {
            this.teamVerwijderenClicked(undefined, this.teamLijst.hoveredIdx);
        }
    }

    verenigingWijzigenClicked() {
        this.editVer = true;
    }

    verenigingWijzigenFinished() {
        this.editVer = false;
    }

    teamSelecterenClicked(idx: number) {
        if (this.teamLijst.isIndexWithinRange(idx)) {
            const item = this.teamLijst.filtered[idx];
            let url = this.getOriginalUrl();
            this.appData.gotoPage(url + '/1', url + '/team/' + item.team.teamId);
            return;
        }
    }

    teamToevoegenClicked() {
        let url = this.getOriginalUrl();
        this.appData.gotoPage(url + '/1', url + '/team/toevoegen');
    }

    teamVerwijderenClicked(event: any, idx: number) {
        event?.stopPropagation();
        if (this.teamLijst.isIndexWithinRange(idx)) {
            //TODO: first confirm and save if confirmed
            const teamToRemove = this.teamLijst.filtered[idx];
            let compNaam = this.teamZitInCompetitie(teamToRemove.team);
            if (compNaam.length) {
                this.alert.showAlert(`Kan team niet verwijderen. Zit nog in KNBB competitie '${compNaam}'.`, 'warning', 5);
                return;
            }
            this.idxToDelete = idx;
            this.confirmVerwijderen(teamToRemove.team);
        }
    }

    private confirmVerwijderen(team: Team) {
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Team '${team.naam}' verwijderen.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        if (confirmed) {
            const teamToRemove = this.teamLijst.filtered[this.idxToDelete];
            this.teamLijst.items = this.teamLijst.items.filter(item => item.team.teamId != teamToRemove.team.teamId);
            this.teamLijst.filtered.splice(this.idxToDelete, 1);
            this.teamLijst.clearSelection();
            this.vereniging.teams = this.teamLijst.items.map(item => item.team);
            this.bssApi.updateVereniging(this.vereniging)
                .then(resp => {
                    this.tabs[1] = `Teams (${this.teamLijst.filtered.length})`;
                    this.alert.showAlert(`Team '${teamToRemove.team.naam}' is verwijderd.`, 'success');
                })
                .catch(err => {
                    this.alert.showError(err);
                });
        }
        this.isDialogOpen = false;
    }

    ledenWijzigenClicked() {
        const url = this.getOriginalUrl();
        this.appData.gotoPage(url + '/2', url + '/spelers');
    }

    activateTab(idx: number) {
        if (idx == this.idxTab) {
            return;
        }
        this.editVer = false;
        this.idxTab = idx;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (!this.editVer) {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                if (event.key === 'ArrowLeft') {
                    this.nextTab(-1);
                }
                if (event.key === 'ArrowRight') {
                    this.nextTab(1);
                }
                return false;
            }
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                if (event.key === 'ArrowUp') {
                    this.teamLijst.hoverPreviousItem();
                }
                if (event.key === 'ArrowDown') {
                    this.teamLijst.hoverNextItem();
                }
                return false;
            }
            if (event.key === 'Enter') {
                if (this.isDialogOpen) {
                    return true;
                }
                if (this.idxTab != 1) {
                    return true;
                }
                this.buttonPressed(event, this.teamButtons[1]);
                return false;
            }
            if (event.key === 'Escape') {
                if (this.isDialogOpen) {
                    return true;
                }
                this.escapePressed();
                return false;
            }
            if (event.key === '+' || event.key === '=') {
                this.buttonPressed(event, this.teamButtons[0]);
                return false;
            }
            if (event.code === 'KeyW') {
                this.buttonPressed(event, this.wijzigButtons[0]);
                return false;
            }
            if (event.key === 'Delete') {
                this.buttonPressed(event, this.teamButtons[2]);
                return false;
            }
            if (event.code === 'KeyL') {
                this.buttonPressed(event, this.ledenButtons[0]);
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
        const id: string | null = this.route.snapshot.paramMap.get('verId');
        if (!id) {
            this.alert.showAlert('Het ID in de URL is undefined.', 'error');
            return;
        }
        const tab: string | null = this.route.snapshot.paramMap.get('tabNr');
        if (tab && Number(tab)) {
            this.idxTab = Number(tab);
        }
        Promise.all([
            this.bssApi.getVereniging(id),
            this.bssApi.getLedenVanVereniging(id, this.spelId),
            this.bssApi.getKnbbCompetities(this.appData.getDistrict().disId, this.spelId)
        ])
            .then(results => {
                this.vereniging = results[0];
                this.comps = results[2];
                let teams = this.vereniging.teams.filter(team => team.spelsoort == this.spelId);
                const fullTeams = this.completeTeamData(teams);
                this.teamLijst.fillItems(fullTeams);
                this.tabs[1] += ` (${this.teamLijst.filtered.length})`;
                this.sortTeams();
                const fullLeden = this.completeLedenData(results[1]);
                this.ledenLijst.fillItems(fullLeden);
                this.tabs[2] += ` (${this.ledenLijst.filtered.length})`;
                this.sortLeden();
                this.subtitle = `Vereniging '${this.vereniging.naam}'`;
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
    }

    private completeTeamData(tms: Team[]): TeamItem[] {
        let result: TeamItem[] = [];
        tms.forEach(tm => {
            let inComps: string[] = [];
            this.comps.forEach(cmp => {
                if (cmp.klasse == tm.klasse) {
                    if (cmp.teams.some(cmpTm => cmpTm.verId == tm.verId && cmpTm.teamId == tm.teamId)) {
                        inComps.push(`${cmp.seizoen} ${cmp.klasse}-${cmp.volgNr}`);
                    }
                }
            });
            result.push({'team': tm, 'inComps': inComps});
        });
        return result;
    }

    private completeLedenData(leden: SpelerWrapper[]): LidItem[] {
        let result: LidItem[] = [];
        leden.forEach(lid => {
            let inTeams: string[] = [];
            this.teamLijst.filtered.forEach(team => {
                if (team.team.teamLeden.some(teamLid => teamLid == lid.speler.id)) {
                    inTeams.push(`${team.team.klasse}-${team.team.volgNr}`);
                }
            });
            result.push({'lid': lid, 'inTeams': inTeams});
        });
        return result;
    }

    private nextTab(direction: number) {
        let idx = this.idxTab + direction;
        if (idx < 0 || idx >= this.tabs.length) {
            return;
        }
        this.activateTab(idx);
    }

    private sortTeams() {
        this.teamLijst.filtered.sort((a: TeamItem, b: TeamItem) => {
            if (a.team.klasse == b.team.klasse) {
                return (a.team.teamId > b.team.teamId) ? 1 : -1;
            }
            else {
                return (a.team.klasse > b.team.klasse) ? 1 : -1;
            }
        });
    }

    private sortLeden() {
        this.ledenLijst.filtered.sort((a: LidItem, b: LidItem) => {
            if (a.lid.getGemiddeldeVanSpel() == b.lid.getGemiddeldeVanSpel()) {
                if (a.lid.getNaam() == b.lid.getNaam()) {
                    return 0;
                }
                else {
                    return (a.lid.getNaam() > b.lid.getNaam()) ? 1 : -1;
                }
            }
            else {
                return b.lid.getGemiddeldeVanSpel() - a.lid.getGemiddeldeVanSpel();
            }
        });
    }

    private teamZitInCompetitie(team: Team): string {
        const foundComp = this.comps.find(comp => {
            return comp.teams.some(tm => tm.verId == team.verId && tm.teamId == team.teamId);
        });
        if (foundComp) {
            return foundComp.naam;
        }
        return '';
    }

    private getOriginalUrl(): string {
        let segments = this.route.snapshot.url.map(s => s.path);
        if (segments.length < 4) {
            return this.router.url;
        }
        let result = '';
        segments.pop();
        segments.forEach(segm => {
            result += '/' + segm;
        });
        return result;
    }

}
