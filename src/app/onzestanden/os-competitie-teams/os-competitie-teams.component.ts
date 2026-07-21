import { Component, HostListener, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { BpCompetitie, BpTeam } from '../../model/bpoint';
import { KnbbCompetitie, KnbbCompTeam } from '../../model/knbb-competitie';
import { Team, Vereniging } from '../../model/vereniging';
import { Alinea, ConfirmDialog } from '../../model/dialogs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { HelpComponent } from '../../shared/help/help.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-os-competitie-teams',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        ConfirmComponent,
        HelpComponent,
        NgClass
    ],
    templateUrl: './os-competitie-teams.component.html',
    styleUrl: './os-competitie-teams.component.css'
})
export class OsCompetitieTeamsComponent extends BaseComponent implements OnInit {
    bpComp: BpCompetitie = new BpCompetitie();
    bssComp: KnbbCompetitie = new KnbbCompetitie();
    bssTeams: Team[] = [];
    bssTeamToRemove: Team = new Team();
    areTeamsInBssCompButNotInBpComp: boolean = false;
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);
    dataReady: boolean = false;

    override escapePressed(): void {
        this.router.navigate(['onzestanden/competities']);
    }

    override previousPressed(): void {
        this.router.navigate(['onzestanden/competities']);
    }

    bpTeamClicked(idx: number) {
        if (this.areTeamsInBssCompButNotInBpComp) {
            return;
        }
        localStorage.setItem('bpTeam', JSON.stringify(this.bpComp.teams[idx]));
        this.router.navigate(['onzestanden/vereniging']);
    }

    bssTeamVerwijderenClicked(event: MouseEvent, idx: number) {
        event.stopPropagation();
        this.bssTeamToRemove = this.bssTeams[idx];
        this.confirmVerwijderen(this.bssTeamToRemove);
    }

    private confirmVerwijderen(team: Team) {
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Team '${team.naam}' verwijderen uit BSS competitie.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        if (confirmed) {
            this.bssComp.teams = this.bssComp.teams.filter(tm => tm.verId != this.bssTeamToRemove.verId || tm.teamId != this.bssTeamToRemove.teamId);
            this.bssApi.updateKnbbCompetitie(this.bssComp)
                .then(resp => {
                    this.alert.showAlert(`Team '${this.bssTeamToRemove.naam}' is verwijderd uit de competitie.`, 'success');
                    this.bssTeams = this.bssTeams.filter(tm => tm.verId != this.bssTeamToRemove.verId || tm.teamId != this.bssTeamToRemove.teamId);
                    this.areTeamsInBssCompButNotInBpComp = this.bssTeams.some(tm => !tm.inBpoint);
                })
                .catch(err => {
                    this.alert.showError(err);
                });
        }
        this.isDialogOpen = false;
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
            if (this.isDialogOpen) {
                return true;
            }
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
        const cmp = localStorage.getItem('bpComp');
        if (!cmp) {
            this.alert.showError('Geen competitie geselecteerd.');
            return;
        }
        this.bpComp = JSON.parse(cmp);
        Promise.all([
            this.bssApi.getKnbbCompetitie(this.bpComp.district.disId, this.bpComp.spelsoortId, this.bpComp.bssId),
            this.bssApi.getVerenigingen()
        ])
        .then(results => {
            this.bssComp = results[0];
            this.bssComp.teams.forEach(compTeam => {
                const bssTeam: Team = this.getBssTeam(compTeam, results[1]);
                if (bssTeam.teamId != '') {
                    this.bssTeams.push(bssTeam);
                }
            });
            this.bpComp.teams.sort(this.compareBpTeams);
            this.bssTeams.sort(this.compareBssTeams);
            this.bssTeams.forEach(bssTeam => {
                bssTeam.inBpoint = false;
                const bpTeam = this.bpComp.teams.find(tm => tm.knbbId == bssTeam.knbbId);
                if (bpTeam) {
                    bssTeam.inBpoint = true;
                    bpTeam.bssVerId = bssTeam.verId;
                    bpTeam.bssTeamId = bssTeam.teamId;
                }
            });
            this.areTeamsInBssCompButNotInBpComp = this.bssTeams.some(tm => !tm.inBpoint);
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private getBssTeam(compTeam: KnbbCompTeam, verenigingen: Vereniging[]): Team {
        const idxVer = verenigingen.findIndex(ver => ver.verId == compTeam.verId);
        if (idxVer < 0) {
            return new Team();
        }
        const idxTeam = verenigingen[idxVer].teams.findIndex(tm => tm.teamId == compTeam.teamId);
        if (idxTeam < 0) {
            return new Team();
        }
        return verenigingen[idxVer].teams[idxTeam];
    }

    private compareBpTeams(a: BpTeam, b: BpTeam): number {
        return (a.knbbId > b.knbbId) ? 1 : -1;
    }

    private compareBssTeams(a: Team, b: Team): number {
        if (a.knbbId == b.knbbId) {
            if (a.naam == b.naam) {
                return 0;
            }
            return (a.naam > b.naam) ? 1 : -1;    
        }
        else {
            if (a.knbbId == '') {
                return -1;
            }
            if (b.knbbId == '') {
                return 1;
            }
            return (a.knbbId > b.knbbId) ? 1 : -1;
        }
    }

}
