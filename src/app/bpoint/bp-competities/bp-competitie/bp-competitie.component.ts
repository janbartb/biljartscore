import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../base/base.component';
import { BpCompetitie, BpTeam, CompTemp } from '../../../model/bpoint';
import { KnbbCompetitie } from '../../../model/knbb-competitie';
import { Button } from '../../../model/button';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { Team, Vereniging } from '../../../model/vereniging';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-bp-competitie',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        SectionHeaderComponent,
        NgClass
    ],
    templateUrl: './bp-competitie.component.html',
    styleUrl: './bp-competitie.component.css'
})
export class BpCompetitieComponent extends BaseComponent implements OnInit {
    bpComp: BpCompetitie = new BpCompetitie();
    bssComp: KnbbCompetitie = new KnbbCompetitie();
    compTemp: CompTemp = new CompTemp();
    bpTeams: BpTeam[] = [];
    bssTeams: Team[] = [];
    escapeCount: number = 0;

    buttonsComp: Button[] = [
        new Button('', 'Toevoegen aan BSS', false),
        new Button('', 'Wijzigen in BSS', false)
    ];

    compButtonClicked(idx: number) {
        if (idx == 0) {
            this.toevoegenCompetitie();
        }
        else if (idx == 1) {
            this.wijzigenCompetitie();
        }
        else {
            this.alert.showError('Geselecteerde button is niet geregistreerd!');
        }
    }

    private toevoegenCompetitie() {
        this.bssComp.competitieId = `${this.bpComp.klasse}-${this.bpComp.volgNr}-${this.bpComp.poule}`;
        this.bssComp.knbbId = this.bpComp.knbbId;
        this.bssComp.district = this.bpComp.district.disId;
        this.bssComp.spelsoort = this.bpComp.spelsoortId;
        this.bssComp.seizoen = this.bpComp.seizoen;
        this.bssComp.klasse = this.bpComp.klasse;
        this.bssComp.volgNr = +this.bpComp.volgNr;
        this.bssComp.poule = +this.bpComp.poule;
        this.bssComp.naam = this.bpComp.naam;
        this.bssComp.maxBeurten = +this.bpComp.maxBeurten;
        this.bssApi.addKnbbCompetitie(this.bssComp)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.bpComp.inBss = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private wijzigenCompetitie() {
        this.bssComp.knbbId = this.bpComp.knbbId;
        this.bssComp.naam = this.bpComp.naam;
        this.bssComp.maxBeurten = +this.bpComp.maxBeurten;
        this.bssApi.updateKnbbCompetitie(this.bssComp)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    teamClicked(idx: number) {
        console.log(this.bpTeams[idx]);
        localStorage.setItem('bpTeam', JSON.stringify(this.bpTeams[idx]));
        this.appData.gotoPage('bpoint/competitie', 'bpoint/compteam');
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
        if (this.bpComp.inBss) {
            this.bssApi.getKnbbCompetitie(this.bpComp.district.disId, this.bpComp.spelsoortId, this.bpComp.bssId)
            .then(result => {
                this.bssComp = result;
                this.initialize();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            this.initialize();
        }
    }

    private initialize() {
        Promise.all([
            this.bssApi.getCompFromBiljartpoint(this.bpComp.poule, this.bpComp.knbbId, '86'),
            this.bssApi.getVerenigingen()
        ])
        .then(results => {
            this.bssTeams = this.getAllKnbbTeams(results[1]);
            this.compTemp = results[0];
            this.bpComp.maxBeurten = this.compTemp.maxBeurten;
            this.compTemp.teams.forEach(tm => {
                let bpTeam = new BpTeam();
                bpTeam.naam = tm.naam;
                bpTeam.bpUrl = tm.bpUrl;
                const idPosStart = bpTeam.bpUrl.indexOf('team_id=') + 8;
                const idPosEnd = bpTeam.bpUrl.indexOf('&compid=')
                bpTeam.knbbId = bpTeam.bpUrl.substring(idPosStart, idPosEnd);
                const foundBssTeam = this.bssTeams.find(tm => tm.knbbId == bpTeam.knbbId);
                if (foundBssTeam) {
                    console.log(bpTeam);
                    console.log(foundBssTeam);
                    bpTeam.bssVerId = foundBssTeam.verId;
                    bpTeam.bssTeamId = foundBssTeam.teamId;
                    bpTeam.bssAantSpl = foundBssTeam.teamLeden.length;
                    if (this.bssComp.competitieId != '') {
                        bpTeam.inBssComp = this.bssComp.teams.some(tm => tm.verId == bpTeam.bssVerId && tm.teamId == bpTeam.bssTeamId);
                    }
                }
                this.bpTeams.push(bpTeam);
            });
            this.bpTeams.sort(this.compareBpTeams);
        })
        .catch(err => {
            console.log(err);
            this.alert.showError(err);
        });
    }

    private getAllKnbbTeams(verenigingen: Vereniging[]): Team[] {
        let result: Team[] = [];
        verenigingen.forEach(ver => {
            ver.teams.forEach(team => {
                if (team.knbbId != '') {
                    result.push(team);
                }
            });
        });
        return result;
    }

    private compareBpTeams(a: BpTeam, b: BpTeam): number {
        if (a.naam == b.naam) {
            return 0;
        }
        return (a.naam > b.naam) ? 1 : -1;
    }
}
