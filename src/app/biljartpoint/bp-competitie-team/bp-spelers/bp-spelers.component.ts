import { Component, HostListener, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { BpCompetitie, BpTeam, TeamPageSpeler } from '../../../model/bpoint';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { Team, Vereniging } from '../../../model/vereniging';
import { Speler, SpelerGemiddelde, SpelerWrapper } from '../../../model/speler';
import { DecimalPipe, NgClass } from '@angular/common';
import { Button } from '../../../model/button';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';

class SpelerToProcess {
    inBSS: boolean = false;
    inTeam: boolean = false;
    inBp: boolean = false;
    toAdd: boolean = false;
    toUpd: boolean = false;
    bpSpeler: TeamPageSpeler = new TeamPageSpeler();
    bssSpeler: SpelerWrapper = new SpelerWrapper(new Speler());
}

@Component({
    selector: 'app-bp-spelers',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass,
        DecimalPipe
    ],
    templateUrl: './bp-spelers.component.html',
    styleUrl: './bp-spelers.component.css'
})
export class BpSpelersComponent extends BaseComponent implements OnInit {
    bpComp: BpCompetitie = new BpCompetitie();
    bpTeam: BpTeam = new BpTeam();
    bpSpelers: TeamPageSpeler[] = [];
    bssVereniging: Vereniging = new Vereniging();
    bssTeam: Team = new Team();
    allSpelers: SpelerWrapper[] = [];
    existingSplIds: string[] = [];
    spelersToProcess: SpelerToProcess[] = [];
    bssTeamSpelersOk: boolean = false;
    spelersToAdd: Speler[] = [];
    spelersToUpd: Speler[] = [];
    dataReady: boolean = false;
    escapeCount: number = 0;

    procButtons: Button[] = [
        new Button('', 'Spelers verwerken in BSS', false)
    ];
    backButtons: Button[] = [
        new Button('', 'Terug naar teams', false)
    ];

    verwerkSpelers() {
        let team = this.bssVereniging.teams.find(tm => tm.teamId == this.bssTeam.teamId);
        if (!team) {
            this.alert.showError(`Team '${this.bssTeam.naam}' niet gevonden in vereniging '${this.bssVereniging.naam}'.`);
            return;
        }
        team.teamLeden = this.spelersToProcess.filter(sp => sp.inBp).map(sp => sp.bssSpeler.speler.id);
        console.log(team);
        if (this.spelersToAdd.length) {
            this.bssApi.addSpelers(this.spelersToAdd)
            .then(resp => {
                if (this.spelersToUpd.length) {
                    this.bssApi.updateSpelers(this.spelersToUpd)
                    .then(resp => {
                        this.updateVereniging();
                    })
                    .catch(err => {
                        this.alert.showError(err);
                    });
                }
                else {
                    this.updateVereniging();
                }
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            if (this.spelersToUpd.length) {
                this.bssApi.updateSpelers(this.spelersToUpd)
                .then(resp => {
                    this.updateVereniging();
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.updateVereniging();
            }
        }
    }

    private updateVereniging() {
        this.bssApi.updateVereniging(this.bssVereniging)
        .then(resp => {
            this.alert.showAlert('Alle gegevens zijn overgenomen in BSS.', 'success');
            setTimeout(() => {
                if (this.spelersToAdd.length || this.spelersToUpd.length) {
                    this.bssApi.getSpelersLijst('3BA')
                    .then(result => {
                        this.allSpelers = result;
                        this.existingSplIds = this.allSpelers.map(sw => sw.speler.id);
                        this.initialize();
                    })
                    .catch(err => {
                        this.alert.showError(err);
                    });
                }
                else {
                    this.initialize();
                }                    
            }, 2000);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    terugNaarTeams() {
        this.appData.goBackToPage('bpoint/compteams');
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
            this.bssApi.getVereniging(this.bpTeam.bssVerId),
            this.bssApi.getSpelersLijst('3BA')
        ])
        .then(results => {
            this.bssVereniging = results[0];
            this.allSpelers = results[1];
            this.existingSplIds = this.allSpelers.map(spl => spl.speler.id);
            const foundTeam = this.bssVereniging.teams.find(tm => tm.knbbId == this.bpTeam.knbbId);
            if (!foundTeam) {
                this.alert.showError(`Biljartpoint team ${this.bpTeam.knbbId} niet gevonden in BSS vereniging ${this.bssVereniging.naam}`);
                return;
            }
            this.bssTeam = foundTeam;
            this.bpSpelers.forEach(spl => {
                spl.splNaam = spl.splNaam.replaceAll('*', '');
            });
            this.initialize();
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private initialize() {
        this.spelersToProcess = this.getSpelersToProcess();
        let bpTeamSpelers = this.spelersToProcess.filter(sp => sp.inBp).map(sp => sp.bssSpeler.speler.id);
        bpTeamSpelers.sort();
        let bssTeamSpelers: String[] = JSON.parse(JSON.stringify(this.bssTeam.teamLeden));
        bssTeamSpelers.sort();
        this.bssTeamSpelersOk = JSON.stringify(bpTeamSpelers) == JSON.stringify(bssTeamSpelers);
        this.fillSpelersToAddOrUpdate();
    }

    private fillSpelersToAddOrUpdate() {
        this.spelersToAdd = [];
        this.spelersToUpd = [];
        this.spelersToProcess.filter(spl => spl.inBp).forEach(spl => {
            if (!spl.inBSS) {
                this.spelersToAdd.push(spl.bssSpeler.speler);
                spl.toAdd = true;
            }
            else {
                let speler: Speler = JSON.parse(JSON.stringify(spl.bssSpeler.speler));
                let changed = false;
                if (speler.knbbId != spl.bpSpeler.splKnbbId) {
                    speler.knbbId = spl.bpSpeler.splKnbbId;
                    changed = true;
                }
                if (spl.bssSpeler.getNaam() != spl.bpSpeler.splNaam) {
                    this.fillSpelerNaam(spl.bpSpeler.splNaamOrig, speler);
                    changed = true;
                }
                if (spl.bssSpeler.getGemiddeldeVanSpel() != +spl.bpSpeler.splMoyenne) {
                    speler.gemiddeldes[spl.bssSpeler.idxMoyenne].gemiddelde = +spl.bpSpeler.splMoyenne;
                    changed = true;
                }
                if (!spl.bssSpeler.isLidVan(this.bssVereniging.verId)) {
                    speler.verenigingIds.push(this.bssVereniging.verId);
                    changed = true;
                }
                if (changed) {
                    this.spelersToUpd.push(speler);
                    spl.toUpd = true;
                }
            }
        });
        console.log(this.spelersToAdd);
        console.log(this.spelersToUpd);
    }

    private getSpelersToProcess(): SpelerToProcess[] {
        let result: SpelerToProcess[] = [];
        this.bpSpelers.forEach(bpSpl => {
            let spelerToProcess: SpelerToProcess = new SpelerToProcess();
            spelerToProcess.inBp = true;
            spelerToProcess.bpSpeler = JSON.parse(JSON.stringify(bpSpl));
            spelerToProcess.bpSpeler.splNaamOrig = spelerToProcess.bpSpeler.splNaam;
            spelerToProcess.bpSpeler.splNaam = spelerToProcess.bpSpeler.splNaam.replaceAll('  ', ' ');
            let foundSpeler = this.allSpelers.find(sp => sp.speler.knbbId == bpSpl.splKnbbId);
            if (foundSpeler) {
                spelerToProcess.bssSpeler = foundSpeler;
                spelerToProcess.inBSS = true;
                spelerToProcess.inTeam = this.bssTeam.teamLeden.some(id => id == spelerToProcess.bssSpeler.speler.id);
                result.push(spelerToProcess);
            }
            else {
                foundSpeler = this.allSpelers.find(sp => sp.getNaam() == spelerToProcess.bpSpeler.splNaam);
                if (foundSpeler) {
                    spelerToProcess.bssSpeler = foundSpeler;
                    spelerToProcess.inBSS = true;
                    spelerToProcess.inTeam = this.bssTeam.teamLeden.some(id => id == spelerToProcess.bssSpeler.speler.id);
                    result.push(spelerToProcess);
                }
                else {
                    spelerToProcess.bssSpeler = this.createNieuweSpeler(spelerToProcess.bpSpeler);
                    result.push(spelerToProcess);
                }
            }
        });
        const tempResult: SpelerToProcess[] = JSON.parse(JSON.stringify(result));
        this.bssTeam.teamLeden.forEach(bssSplId => {
            let foundSpeler = this.allSpelers.find(sp => sp.speler.id == bssSplId);
            if (foundSpeler) {
                if (this.bssSpelerNotInBpTeam(foundSpeler, tempResult)) {
                    let spelerToProcess: SpelerToProcess = new SpelerToProcess();
                    spelerToProcess.inBSS = true;
                    spelerToProcess.bssSpeler = foundSpeler;
                    result.push(spelerToProcess);
                }
            }
        });
        return result;
    }

    private bssSpelerNotInBpTeam(bssSpeler: SpelerWrapper, splsToProcess: SpelerToProcess[]): boolean {
        let inBpTeam = false;
        if (bssSpeler.speler.knbbId != '') {
            inBpTeam = splsToProcess.some(stp => stp.bpSpeler.splKnbbId == bssSpeler.speler.knbbId);
        }
        if (!inBpTeam) {
            inBpTeam = splsToProcess.some(stp => stp.bpSpeler.splNaam == bssSpeler.getNaam());
        }
        return !inBpTeam;
    }

    private createNieuweSpeler(spl: TeamPageSpeler): SpelerWrapper {
        let speler: Speler = new Speler();
        speler.id = this.createSpelerId(spl.splNaam);
        this.existingSplIds.push(speler.id);
        speler.knbbId = spl.splKnbbId;
        this.fillSpelerNaam(spl.splNaamOrig, speler);
        speler.spreeknaam = speler.vnaam;
        speler.verenigingIds.push(this.bssVereniging.verId);
        const moy1: SpelerGemiddelde = new SpelerGemiddelde();
        moy1.spelId = '3BA';
        moy1.gemiddelde = +spl.splMoyenne;
        speler.gemiddeldes.push(moy1);
        return new SpelerWrapper(speler, '3BA');
    }

    private fillSpelerNaam(naam: string, speler: Speler) {
        speler.vnaam = '';
        speler.anaam = '';
        speler.tvoeg = '';
        const pos = naam.indexOf('  ');
        if (pos > 0) {
            speler.vnaam = naam.substring(0, pos);
            speler.anaam = naam.substring(pos + 2);
        }
        else {
            const naamArr = naam.split(' ');
            naamArr.forEach((naamDeel, idx) => {
                if (naamDeel.length > 0) {
                    if (idx == 0) {
                        speler.vnaam = naamDeel;
                    }
                    else if (idx == naamArr.length - 1) {
                        speler.anaam = naamDeel;
                    }
                    else {
                        const spaceToAdd: string = (speler.tvoeg == '') ? '' : ' ';
                        speler.tvoeg += spaceToAdd + naamDeel;
                    }
                }
            });    
        }
    }
 
    private createSpelerId(naam: string): string {
        if (naam == '') {
            return '';
        }
        const words = naam.split(' ');
        let resultId = '';
        words.forEach(word => {
            if (word.trim().length > 0) {
                const char = word.trim().charAt(0);
                if (char != "'" && char != '`') {
                    resultId += char;
                }
            }
        });
        let cnt = 1;
        let prefixId = resultId;
        let resultOk = false;
        while (!resultOk) {
            resultOk = !this.existingSplIds.some(id => id == resultId);
            if (!resultOk) {
                cnt++;
                resultId = prefixId + cnt;
            }
        }
        return resultId;
    }

}
