import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../base/base.component';
import { KnbbCompetitie, KnbbCompTeam, KnbbCompTeamSpeler } from '../../../model/knbb-competitie';
import { List } from '../../../model/list';
import { Team } from '../../../model/vereniging';
import { Button } from '../../../model/button';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { HelperService } from '../../../services/helper.service';

class SelectieTeam {
    team: Team = new Team();
    selected: boolean = false;

    constructor(tm: Team, sel: boolean) {
        this.team = tm;
        this.selected = sel;
    }
}

class CompTeam {
    key: KnbbCompTeam = new KnbbCompTeam('', '');
    data: Team = new Team();

    constructor(team: Team) {
        this.key = new KnbbCompTeam(team.verId, team.teamId);
        this.data = team;
    }
}

@Component({
    selector: 'app-knbb-competitie-edit-teams',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass
    ],
    templateUrl: './knbb-competitie-edit-teams.component.html',
    styleUrl: './knbb-competitie-edit-teams.component.css'
})
export class KnbbCompetitieEditTeamsComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);
    route = inject(ActivatedRoute);

    competitie: KnbbCompetitie = new KnbbCompetitie();
    compTeams: CompTeam[] = [];
    teamLijst: List<SelectieTeam> = new List<SelectieTeam>();
    subtitle: string = '';
    subtitle2: string = '';
    teamAlToegevoegd: boolean = false;
    teamsChanged: boolean = false;

    enterButtons: Button[] = [
        new Button('Enter', 'Team toevoegen', true),
        new Button('Enter', 'Team verwijderen', true)
    ];
    opslaanButtons: Button[] = [new Button('Ctrl+Enter', 'Opslaan', true)];

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.teamClicked(this.teamLijst.hoveredIdx);
            }
            if (button.key == 'Ctrl+Enter') {
                this.opslaanClicked();
            }
        }, 300);
    }

    override escapePressed(): void {
        if (this.teamLijst.hoveredIdx >= 0) {
            this.teamLijst.clearSelection();
            return;
        }
        super.escapePressed();
    }

    opslaanClicked() {
        if (!this.teamsChanged) {
            return;
        }
        let teamsToAdd: KnbbCompTeam[] = [];
        this.compTeams.forEach(ct => teamsToAdd.push(ct.key));
        this.competitie.teams = teamsToAdd;
        //console.log(this.competitie);
        this.bssApi.updateKnbbCompetitie(this.competitie)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.teamLijst.selectedIdx = -1;
            this.escapePressed();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    teamClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.teamLijst.hoverItem(idx);
        this.setActionForHoveredTeam();
        if (!this.teamAlToegevoegd) {
            this.toevoegenClicked();
        }
        else if (this.teamAlToegevoegd) {
            this.verwijderenClicked();
        }
        this.haveTeamsChanged();
    }

    toevoegenClicked() {
        const team = this.teamLijst.getHoveredItem();
        if (team) {
            let teamToAdd: CompTeam = new CompTeam(team.team);
            this.compTeams.push(teamToAdd);
            this.compTeams.sort(this.compareCompTeams);
            this.setActionForHoveredTeam();
        }
    }

    verwijderenClicked() {
        const teamToRemove = this.teamLijst.getHoveredItem();
        if (teamToRemove) {
            const idx = this.compTeams.findIndex(cteam => cteam.key.verId == teamToRemove.team.verId && cteam.key.teamId == teamToRemove.team.teamId);
            if (idx >= 0) {
                this.compTeams.splice(idx, 1);
                this.setActionForHoveredTeam();
            }
        }
    }

    private setActionForHoveredTeam() {
        if (this.teamLijst.hoveredIdx < 0) {
            return;
        }
        const team = this.teamLijst.filtered[this.teamLijst.hoveredIdx];
        team.selected = this.teamAlToegevoegd = this.isTeamGeselecteerd(team.team);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        if (this.isDialogOpen) {
            return false;
        }
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.teamLijst.hoverPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.teamLijst.hoverNextItem();
            }
            this.setActionForHoveredTeam();
            return false;
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.buttonPressed(this.opslaanButtons[0]);
                return false;    
            }
            if (this.teamLijst.hoveredIdx >= 0) {
                this.buttonPressed(this.enterButtons[this.teamAlToegevoegd ? 1 : 0]);
                return false;
            }
            return true;
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
        this.subtitle = 'KNBB competities ' + this.appData.getSeizoen();
        const compId: string | null = this.route.snapshot.paramMap.get('compId');
        if (!compId) {
            this.alert.showAlert('Het competitie ID in de URL is undefined.', 'error');
            return;
        }
        this.getData(compId);
    }

    private getData(id: string) {
        Promise.all([
            this.bssApi.getKnbbCompetitie(this.appData.getSeizoen(), this.appData.getDistrict().disId, this.spelId, id),
            this.bssApi.getVerenigingen()
        ])
        .then(results => {
            this.competitie = results[0];
            let teams = this.helper.getCompetitieTeamsData(this.competitie, results[1]);
            teams.forEach(tm => {
                this.compTeams.push(new CompTeam(tm));
            })
            this.compTeams.sort(this.compareCompTeams);
            this.subtitle2 = `Teams in competitie '${this.competitie.competitieId} ${this.competitie.naam}'`;
            this.bssApi.getTeamsForSpelAndKlasse(this.competitie.spelsoort, this.competitie.klasse)
            .then(data => {
                data.sort(this.compareTeams);
                let selData: SelectieTeam[] = [];
                data.forEach(tm => {
                    selData.push(new SelectieTeam(tm, this.isTeamGeselecteerd(tm)));
                });
                this.teamLijst.fillItems(selData);
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private isTeamGeselecteerd(tm: Team): boolean {
        return this.compTeams.some(cteam => cteam.key.verId == tm.verId && cteam.key.teamId == tm.teamId);
    }

    private haveTeamsChanged() {
        this.teamsChanged = this.compTeams.length != this.competitie.teams.length ||
                this.competitie.teams.some((team) => {
                    return this.compTeams.findIndex(ct => ct.key.verId == team.verId && ct.key.teamId == team.teamId) < 0;
                });
    }

    private compareTeams(a: Team, b: Team) {
        return (a.naam > b.naam) ? 1 : -1;
    }

    private compareCompTeams(a: CompTeam, b: CompTeam) {
        return (a.data.naam > b.data.naam) ? 1 : -1;
    }

}
