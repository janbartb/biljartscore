import { Component, HostListener, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { District } from '../../model/district';
import { KnbbCompetitie, KnbbCompTeam } from '../../model/knbb-competitie';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { FormsModule } from '@angular/forms';
import { Team, Vereniging } from '../../model/vereniging';
import { Button } from '../../model/button';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { Alinea, ConfirmDialog } from '../../model/dialogs';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { HelpComponent } from '../../shared/help/help.component';

interface CompToDelete {
    comp: KnbbCompetitie;
    teams: TeamToDelete[];
    verwijderd: boolean;
}

interface TeamToDelete {
    team: Team;
    verwijderd: boolean;
}

@Component({
    selector: 'app-bp-del-seizoen',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ConfirmComponent,
        HelpComponent,
        FormsModule
    ],
    templateUrl: './bp-del-seizoen.component.html',
    styleUrl: './bp-del-seizoen.component.css'
})
export class BpDelSeizoenComponent extends BaseComponent implements OnInit {
    district: District = new District();
    competities: KnbbCompetitie[] = [];
    compsToDelete: CompToDelete[] = [];
    verenigingen: Vereniging[] = [];
    seizoenen: string[] = [];
    seizoen: string = '';
    huidigSeizoen: string = '';
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    buttons: Button[] = [
        new Button('Enter', 'Verwijderen', true)
    ];

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            this.confirmVerwijderen();
        }, 300);
    }

    seizoenSelected() {
        this.compsToDelete = [];
        this.competities.forEach(cmp => {
            if (cmp.seizoen <= this.seizoen) {
                let compToDelete: CompToDelete = { 'comp': cmp, 'teams': [], 'verwijderd': false };
                cmp.teams.forEach(tm => {
                    const teamInBss = this.getBssTeam(tm);
                    if (teamInBss) {
                        let TeamToDelete: TeamToDelete = { 'team': teamInBss, 'verwijderd': false };
                        compToDelete.teams.push(TeamToDelete);
                    }
                });
                this.compsToDelete.push(compToDelete);
            }
        });
    }

    private verwijderSeizoenen() {
        let i = 0;
        this.compsToDelete.forEach(comptd => {
            comptd.teams.forEach(teamtd => {
                setTimeout(() => {
                    const verIdx = this.getVerenigingIndex(teamtd.team);
                    if (verIdx >= 0) {
                        const teamIdx = this.getTeamIndex(verIdx, teamtd.team);
                        if (teamIdx >= 0) {
                            this.verenigingen[verIdx].teams.splice(teamIdx, 1);
                            teamtd.verwijderd = true;
                        }
                    }
                }, i * 200);
                i++;
            });
            setTimeout(() => {
                const compIdx = this.getCompetitieIndex(comptd.comp);
                if (compIdx >= 0) {
                    this.competities.splice(compIdx, 1);
                    comptd.verwijderd = true;
                }
            }, i * 200);
            i++;
        });
        setTimeout(() => {
            this.bssApi.saveKnbbCompetities(this.competities, this.district.disId, this.spelId)
            .then(resp => {
                this.bssApi.saveVerenigingen(this.verenigingen)
                .then(resp => {
                    this.alert.showAlert('De aangegeven KNBB competities en teams zijn verwijderd.', 'success', 4);
                    setTimeout(() => {
                        this.getAllData();
                    }, 4000);
                })
                .catch(err => {
                    this.alert.showError(err);
                });    
            })
            .catch(err => {
                this.alert.showError(err);
            });    
        }, i * 200);
    }

    confirmVerwijderen() {
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea(['Alle competities en teams in de lijst verwijderen.']));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijder seizoen(en)', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        if (confirmed) {
            this.verwijderSeizoenen();
        }
        this.isDialogOpen = false;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.alert.helpVisible) {
            this.alert.hideHelp();
            return false;
        }        
        if (this.isDialogOpen) {
            return true;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(this.buttons[0]);
            return false;
        }
        if (event.key === 'Escape' || event.key === 'Backspace') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyH' || event.code === 'Slash') {
            super.helpClicked();
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.district = this.appData.getDistrict();
        if (this.district.disId == '') {
            this.alert.showAlert('Er is geen voorkeurdistrict opgegeven bij de instellingen.', 'warning', 5);
            return;
        }
        this.huidigSeizoen = this.appData.getSeizoen();
        this.getAllData();
    }

    private getAllData() {
        this.seizoen = '';
        this.seizoenen = [];
        this.compsToDelete = [];
        Promise.all([
            this.bssApi.getKnbbCompetities(this.district.disId, this.spelId),
            this.bssApi.getVerenigingen()
        ])
        .then(results => {
            this.competities = results[0];
            this.verenigingen = results[1];
            if (this.competities.length) {
                let seasons = this.competities.map(cmp => cmp.seizoen);
                const mySet = new Set(seasons); // remove duplicates
                this.seizoenen = [...mySet];
                this.seizoenen.sort((a, b) => {
                    return a > b ? -1 : 1;
                });
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });    
    }

    private getBssTeam(compTeam: KnbbCompTeam): Team | undefined {
        const idxVer = this.verenigingen.findIndex(ver => ver.verId == compTeam.verId);
        if (idxVer < 0) {
            return undefined;
        }
        const idxTeam = this.verenigingen[idxVer].teams.findIndex(tm => tm.teamId == compTeam.teamId);
        if (idxTeam < 0) {
            return undefined;
        }
        return this.verenigingen[idxVer].teams[idxTeam];
    }

    private getVerenigingIndex(team: Team): number {
        return this.verenigingen.findIndex(ver => ver.verId == team.verId);
    }

    private getTeamIndex(verenigingIdx: number, team: Team): number {
        return this.verenigingen[verenigingIdx].teams.findIndex(tm => tm.teamId == team.teamId);
    }

    private getCompetitieIndex(comp: KnbbCompetitie): number {
        return this.competities.findIndex(cmp => cmp.competitieId == comp.competitieId);
    }

    private async delay(ms: number) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }

}
