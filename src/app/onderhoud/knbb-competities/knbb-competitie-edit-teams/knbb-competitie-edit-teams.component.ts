import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../base/base.component';
import { KnbbCompetitie, KnbbCompTeam, KnbbCompTeamSpeler } from '../../../model/knbb-competitie';
import { List } from '../../../model/list';
import { Team } from '../../../model/vereniging';
import { Button } from '../../../model/button';

@Component({
    selector: 'app-knbb-competitie-edit-teams',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './knbb-competitie-edit-teams.component.html',
    styleUrl: './knbb-competitie-edit-teams.component.css'
})
export class KnbbCompetitieEditTeamsComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);

    competitie: KnbbCompetitie = new KnbbCompetitie();
    compTeams: KnbbCompTeam[] = [];
    teamLijst: List<Team> = new List<Team>();
    subtitle: string = '';
    subtitle2: string = '';
    teamsChanged: boolean = false;

    enterButton: Button = new Button('Enter', '', true);
    opslaanButton: Button = new Button('Ctrl+Enter', 'Opslaan', true);

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.teamClicked(this.teamLijst.selectedIdx);
            }
            if (button.key == 'Ctrl+Enter') {
                this.opslaanClicked();
            }
        }, 300);
    }

    override escapePressed(): void {
        if (this.teamLijst.selectedIdx >= 0) {
            this.teamLijst.clearSelection();
            return;
        }
        super.escapePressed();
    }

    opslaanClicked() {
        if (!this.teamsChanged) {
            return;
        }
        this.competitie.teams = this.compTeams;
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
        this.teamLijst.selectItem(idx);
        this.setActionForSelectedTeam();
        if (this.enterButton.text == 'Team toevoegen') {
            this.toevoegenClicked();
        }
        else if (this.enterButton.text == 'Team verwijderen') {
            this.verwijderenClicked();
        }
        this.haveTeamsChanged();
    }

    toevoegenClicked() {
        const team = this.teamLijst.getSelectedItem();
        if (team) {
            let teamToAdd: KnbbCompTeam = new KnbbCompTeam(team);
            team.teamLeden.forEach(lid => {
                let speler: KnbbCompTeamSpeler = new KnbbCompTeamSpeler(lid);
                teamToAdd.spelers.push(speler);
            });
            this.compTeams.push(teamToAdd);
            this.compTeams.sort(this.compareCompTeams);
            this.setActionForSelectedTeam();
        }
    }

    verwijderenClicked() {
        const teamToRemove = this.teamLijst.getSelectedItem();
        if (teamToRemove) {
            const idx = this.compTeams.findIndex(cteam => cteam.verId == teamToRemove.verId && cteam.teamId == teamToRemove.teamId);
            if (idx >= 0) {
                this.compTeams.splice(idx, 1);
                this.setActionForSelectedTeam();
            }
        }
    }

    private setActionForSelectedTeam() {
        this.enterButton.text = '';
        const team = this.teamLijst.getSelectedItem();
        if (!team) {
            return;
        }
        const alToegevoegd = this.compTeams.some(cteam => cteam.verId == team.verId &&  cteam.teamId == team.teamId);
        this.enterButton.text = alToegevoegd ? 'Team verwijderen' : 'Team toevoegen'
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        if (this.isDialogOpen) {
            return false;
        }
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.teamLijst.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.teamLijst.selectNextItem();
            }
            this.setActionForSelectedTeam();
            return false;
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.buttonPressed(this.opslaanButton);
                return false;    
            }
            this.buttonPressed(this.enterButton);
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
        this.subtitle = 'KNBB competities ' + this.appData.getSeizoen();
        const compId: string | null = this.route.snapshot.paramMap.get('compId');
        if (!compId) {
            this.alert.showAlert('Het competitie ID in de URL is undefined.', 'error');
            return;
        }
        this.getData(compId);
    }

    private getData(id: string) {
        this.bssApi.getKnbbCompetitie(this.appData.getSeizoen(), this.appData.getDistrict().disId, this.spelId, id)
        .then(result => {
            this.competitie = result;
            this.competitie.teams.sort(this.compareCompTeams);
            this.compTeams = JSON.parse(JSON.stringify(this.competitie.teams));
            this.subtitle2 = `Teams in competitie '${this.competitie.competitieId} ${this.competitie.naam}'`;
            this.bssApi.getTeamsForSpelAndKlasse(this.competitie.spelsoort, this.competitie.klasse)
            .then(data => {
                data.sort(this.compareTeams);
                this.teamLijst.fillItems(data);
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private haveTeamsChanged() {
        this.teamsChanged = this.compTeams.length != this.competitie.teams.length ||
                this.competitie.teams.some((team, idx) => {
                    return team.compTeamId != this.compTeams[idx].compTeamId;
                });
    }

    private compareTeams(a: Team, b: Team) {
        return (a.naam > b.naam) ? 1 : -1;
    }

    private compareCompTeams = (a: KnbbCompTeam, b: KnbbCompTeam) => {
        return (a.naam > b.naam) ? 1 : -1;
    }
}
