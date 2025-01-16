import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { BpCompetitie, BpLokaliteit, BpTeam, TeamPageData, TeamPageSpeler } from '../../../../model/bpoint';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { Team, Vereniging } from '../../../../model/vereniging';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates, notEmpty } from '../../../../directives/validators.directive';
import { DecimalPipe, NgClass } from '@angular/common';
import { Button } from '../../../../model/button';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';
import { Speler, SpelerGemiddelde, SpelerWrapper } from '../../../../model/speler';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';
import { KnbbCompetitie, KnbbCompTeam } from '../../../../model/knbb-competitie';

class SpelerToProcess {
    inBSS: boolean = false;
    bpSpeler: TeamPageSpeler = new TeamPageSpeler();
    bssSpeler: SpelerWrapper = new SpelerWrapper(new Speler());
}

@Component({
    selector: 'app-bp-competitie-team',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass,
        DecimalPipe
    ],
    templateUrl: './bp-competitie-team.component.html',
    styleUrl: './bp-competitie-team.component.css'
})
export class BpCompetitieTeamComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    pageData: TeamPageData = new TeamPageData();
    bpComp: BpCompetitie = new BpCompetitie();
    bpTeam: BpTeam = new BpTeam();
    bpLokaliteit: BpLokaliteit = new BpLokaliteit();
    bssCompetitie: KnbbCompetitie = new KnbbCompetitie();
    bssVerenigingen: Vereniging[] = [];
    bssVereniging: Vereniging = new Vereniging();
    bssTeam: Team = new Team();
    bssTeamId: string = '';
    bssTeamIdOk: boolean = true;
    bssTeamSpelersOk: boolean = false;
    spelersToProcess: SpelerToProcess[] = [];
    spelersToAdd: Speler[] = [];
    spelersToUpd: Speler[] = [];
    allSpelers: SpelerWrapper[] = [];
    existingVerIds: string[] = [];
    existingTeamIds: string[] = [];
    existingSpelerIds: string[] = [];
    subtitle: string = '';
    sectionTitle: string = '';
    escapeCount: number = 0;

    verenigingForm!: FormGroup | null;
    teamForm!: FormGroup | null;
    teamButtons: Button[] = [new Button('', 'Team toevoegen', false)];
    splButtons: Button[] = [
        new Button('', 'Spelers verwerken in BSS', false)
    ];

    teamToevoegen() {
        if (this.bssVereniging.verId == '') {
            this.verenigingEnTeamToevoegen();
        }
        else {
            this.teamToevoegenAanVereniging();
        }
    }

    private verenigingEnTeamToevoegen() {
        this.bssVereniging = new Vereniging();
        this.bssVereniging.verId = this.verId?.value;
        this.bssVereniging.knbbId = this.verKnbbId?.value;
        this.bssVereniging.naam = this.verNaam?.value;
        this.bssVereniging.korteNaam = this.verKorteNaam?.value;
        this.bssVereniging.locatie = this.bpLokaliteit.naam;
        
        this.bssTeam = new Team();
        this.bssTeam.verId = this.bssVereniging.verId;
        this.bssTeam.teamId = this.bssTeamId;
        this.bssTeam.knbbId = this.bpTeam.knbbId;
        this.bssTeam.spelsoort = this.bpComp.spelsoortId;
        this.bssTeam.klasse = this.bpComp.klasse;
        this.bssTeam.volgNr = this.teamVolgNr?.value;
        this.bssTeam.naam = this.teamNaam?.value;
        this.bssVereniging.teams.push(this.bssTeam);

        this.bssApi.addVereniging(this.bssVereniging)
        .then(resp => {
            this.existingVerIds.push(this.bssVereniging.verId);
            this.existingTeamIds.push(this.bssTeam.teamId);
            if (this.bpComp.inBss) {
                this.teamAanCompetitieToevoegen();
            }
            else {
                this.competitieEnTeamToevoegen();
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private teamToevoegenAanVereniging() {
        this.bssTeam = new Team();
        this.bssTeam.verId = this.bssVereniging.verId;
        this.bssTeam.teamId = this.bssTeamId;
        this.bssTeam.knbbId = this.bpTeam.knbbId;
        this.bssTeam.spelsoort = this.bpComp.spelsoortId;
        this.bssTeam.klasse = this.bpComp.klasse;
        this.bssTeam.volgNr = this.teamVolgNr?.value;
        this.bssTeam.naam = this.teamNaam?.value;
        this.bssVereniging.teams.push(this.bssTeam);
        this.bssApi.updateVereniging(this.bssVereniging)
        .then(resp => {
            this.existingTeamIds.push(this.bssTeam.teamId);
            if (this.bpComp.inBss) {
                this.teamAanCompetitieToevoegen();
            }
            else {
                this.competitieEnTeamToevoegen();
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private competitieEnTeamToevoegen() {
        this.bssCompetitie = new KnbbCompetitie();
        this.bssCompetitie.competitieId = this.bpComp.bssId;
        this.bssCompetitie.knbbId = this.bpComp.knbbId;
        this.bssCompetitie.district = this.bpComp.district.disId;
        this.bssCompetitie.spelsoort = this.bpComp.spelsoortId;
        this.bssCompetitie.seizoen = this.bpComp.seizoen;
        this.bssCompetitie.klasse = this.bpComp.klasse;
        this.bssCompetitie.volgNr = +this.bpComp.volgNr;
        this.bssCompetitie.poule = +this.bpComp.poule;
        this.bssCompetitie.naam = this.bpComp.naam;
        this.bssCompetitie.maxBeurten = +this.bpComp.maxBeurten;
        this.bssCompetitie.teams.push(new KnbbCompTeam(this.bssTeam.verId, this.bssTeam.teamId));
        this.bssApi.addKnbbCompetitie(this.bssCompetitie)
        .then(resp => {
            this.bpComp.inBss = true;
            localStorage.setItem('bpComp', JSON.stringify(this.bpComp));
            this.alert.showAlert('Het team is toegevoegd aan BSS.', 'success');
            this.initialize();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private teamAanCompetitieToevoegen() {
        this.bssCompetitie.teams.push(new KnbbCompTeam(this.bssTeam.verId, this.bssTeam.teamId));
        this.bssApi.updateKnbbCompetitie(this.bssCompetitie)
        .then(resp => {
            this.alert.showAlert('Het team is toegevoegd aan BSS.', 'success');
            this.initialize();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    verwerkSpelers() {
        let team = this.bssVereniging.teams.find(tm => tm.teamId == this.bssTeam.teamId);
        if (!team) {
            this.alert.showError(`Team '${this.bssTeam.naam}' niet gevonden in vereniging '${this.bssVereniging.naam}'.`);
            return;
        }
        team.teamLeden = this.spelersToProcess.map(sp => sp.bssSpeler.speler.id);
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
            if (this.spelersToAdd.length || this.spelersToUpd.length) {
                this.bssApi.getSpelersLijst('3BA')
                .then(result => {
                    this.allSpelers = result;
                    this.existingSpelerIds = this.allSpelers.map(sw => sw.speler.id);
                    this.initialize();
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.initialize();
            }
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
        if (this.bpComp.inBss) {
            this.bssApi.getKnbbCompetitie(this.bpComp.district.disId, this.bpComp.spelsoortId, this.bpComp.bssId)
            .then(result => {
                this.bssCompetitie = result;
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        this.subtitle = `Competitie ${this.bpComp.knbbId} - Team ${this.bpTeam.knbbId}`;
        Promise.all([
            this.bssApi.getTeamFromBiljartpoint(this.bpTeam.knbbId, this.bpComp.knbbId, this.bpComp.poule, this.bpComp.district.knbbId),
            this.bssApi.getVerenigingen(),
            this.bssApi.getSpelersLijst('3BA')
        ])
        .then(results => {
            this.pageData = results[0];
            this.pageData.spelers.forEach(spl => {
                spl.splNaam = spl.splNaam.replaceAll('*', '');
            });
            this.allSpelers = results[2];
            this.existingSpelerIds = this.allSpelers.map(sw => sw.speler.id);
            const pos = this.pageData.lokData.indexOf(' ');
            this.bpLokaliteit.knbbId = this.pageData.lokData.substring(0, pos);
            this.bpLokaliteit.naam = this.pageData.lokData.substring(pos + 1);
            this.existingVerIds = results[1].map(ver => ver.verId);
            this.bssVereniging = this.getVereniging(results[1], this.bpLokaliteit.knbbId);
            this.existingTeamIds = this.bssVereniging.teams.map(tm => tm.teamId);
            this.bssTeam = this.getBssTeam(this.bssVereniging.teams, this.bpTeam.knbbId);
            this.initialize();
        })
        .catch(err => {
            console.log(err);
            this.alert.showError(err);
        });
    }

    private initialize() {
        this.verenigingForm = null;
        this.teamForm = null;
        this.spelersToProcess = [];
        if (this.bssVereniging.verId == '') {
            this.sectionTitle = 'Team toevoegen in BSS';
            this.createVerenigingForm(this.bpLokaliteit);
            this.createTeamForm(this.bpTeam, this.bpComp);
        }
        else {
            if (this.bssTeam.teamId == '') {
                this.sectionTitle = 'Team toevoegen in BSS';
                this.createTeamForm(this.bpTeam, this.bpComp);
            }
            else {
                console.log(this.pageData);
                this.sectionTitle = 'Te verwerken spelers';
                this.spelersToProcess = this.getSpelersToProcess();
                console.log(this.spelersToProcess);
                let bpTeamSpelers = this.spelersToProcess.map(sp => sp.bssSpeler.speler.id);
                bpTeamSpelers.sort();
                let bssTeamSpelers: String[] = JSON.parse(JSON.stringify(this.bssTeam.teamLeden));
                bssTeamSpelers.sort();
                this.bssTeamSpelersOk = JSON.stringify(bpTeamSpelers) == JSON.stringify(bssTeamSpelers);
                this.fillSpelersToAddOrUpdate();
            }
        }
    }

    private fillSpelersToAddOrUpdate() {
        this.spelersToAdd = [];
        this.spelersToUpd = [];
        this.spelersToProcess.forEach(spl => {
            if (!spl.inBSS) {
                this.spelersToAdd.push(spl.bssSpeler.speler);
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
                }
            }
        });
        console.log(this.spelersToAdd);
        console.log(this.spelersToUpd);
    }

    private getVereniging(verenigingen: Vereniging[], knbbId: string): Vereniging {
        let foundVereniging = verenigingen.find(ver => ver.knbbId == knbbId);
        return foundVereniging ? foundVereniging : new Vereniging();
    }

    private getBssTeam(teams: Team[], knbbId: string): Team {
        let foundTeam = teams.find(tm => tm.knbbId == knbbId);
        return foundTeam ? foundTeam : new Team()
    }

    private createVerenigingForm(lokaliteit: BpLokaliteit) {
        this.verenigingForm = this.fb.nonNullable.group({
            verId: [this.createVerenigingId(this.bpTeam.naam), [Validators.required, notEmpty(), noDuplicates(this.existingVerIds)]],
            verKnbbId: [lokaliteit.knbbId, [Validators.required, notEmpty()]],
            verNaam: [this.bpTeam.naam, [Validators.required, notEmpty()]],
            verLokatie: [lokaliteit.naam],
            verKorteNaam: ['', [Validators.required, notEmpty()]]
        });
    }

    private createTeamForm(team: BpTeam, comp: BpCompetitie) {
        this.bssTeamId = this.bpComp.spelsoortId + '-' + this.bpComp.klasse + '-' + this.getNextTeamVolgNr();
        this.bssTeamIdOk = true;
        this.teamForm = this.fb.nonNullable.group({
            teamVolgNr: [this.getNextTeamVolgNr(), [Validators.min(1)]],
            teamNaam: [this.bpTeam.naam, [Validators.required, notEmpty()]]
        });
        this.teamVolgNr?.valueChanges.subscribe(val => {
            this.generateTeamId();
        });
    }

    private generateTeamId() {
        this.bssTeamId = this.bpComp.spelsoortId + '-' + this.bpComp.klasse + '-';
        if (this.teamVolgNr?.value > 0) {
            this.bssTeamId += this.teamVolgNr?.value;
        }
        this.bssTeamIdOk = !this.existingTeamIds.some(id => id == this.bssTeamId);
    }

    private getSpelersToProcess(): SpelerToProcess[] {
        let result: SpelerToProcess[] = [];
        this.pageData.spelers.forEach(bpSpl => {
            let spelerToProcess: SpelerToProcess = new SpelerToProcess();
            spelerToProcess.bpSpeler = JSON.parse(JSON.stringify(bpSpl));
            spelerToProcess.bpSpeler.splNaamOrig = spelerToProcess.bpSpeler.splNaam;
            spelerToProcess.bpSpeler.splNaam = spelerToProcess.bpSpeler.splNaam.replaceAll('  ', ' ');
            let foundSpeler = this.allSpelers.find(sp => sp.speler.knbbId == bpSpl.splKnbbId);
            if (foundSpeler) {
                spelerToProcess.inBSS = true;
                spelerToProcess.bssSpeler = foundSpeler;
                result.push(spelerToProcess);
            }
            else {
                foundSpeler = this.allSpelers.find(sp => sp.getNaam() == spelerToProcess.bpSpeler.splNaam);
                if (foundSpeler) {
                    spelerToProcess.inBSS = true;
                    spelerToProcess.bssSpeler = foundSpeler;
                    result.push(spelerToProcess);
                }
                else {
                    spelerToProcess.bssSpeler = this.createNieuweSpeler(spelerToProcess.bpSpeler);
                    result.push(spelerToProcess);
                }
            }
        });
        return result;
    }

    private createNieuweSpeler(spl: TeamPageSpeler): SpelerWrapper {
        let speler: Speler = new Speler();
        speler.id = this.createSpelerId(spl.splNaam);
        this.existingSpelerIds.push(speler.id);
        speler.knbbId = spl.splKnbbId;
        this.fillSpelerNaam(spl.splNaamOrig, speler);
        speler.spreeknaam = speler.vnaam;
        speler.verenigingIds.push(this.bssVereniging.verId);
        const moy1: SpelerGemiddelde = new SpelerGemiddelde();
        moy1.spelId = '3BA';
        moy1.gemiddelde = +spl.splMoyenne;
        speler.gemiddeldes.push(moy1);
        const moy2: SpelerGemiddelde = new SpelerGemiddelde();
        moy2.spelId = 'LIB';
        moy2.gemiddelde = 0;
        speler.gemiddeldes.push(moy2);
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
 
    private compareBssSpelers(a: SpelerWrapper, b: SpelerWrapper): number {
        if (a.getGemiddeldeVanSpel() == b.getGemiddeldeVanSpel()) {
            return a.getNaam() < b.getNaam() ? -1 : 1;
        }
        else {
            return b.getGemiddeldeVanSpel() - a.getGemiddeldeVanSpel();
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
            resultOk = !this.existingSpelerIds.some(id => id == resultId);
            if (!resultOk) {
                cnt++;
                resultId = prefixId + cnt;
            }
        }
        return resultId;
    }

    private getNextTeamVolgNr(): number {
        const currentTeams = this.bssVereniging.teams.filter(tm => {
            return tm.spelsoort == this.bpComp.spelsoortId && tm.klasse == this.bpComp.klasse;
        });
        let hoogsteNr = 0;
        currentTeams.forEach(tm => {
            if (tm.volgNr > hoogsteNr) {
                hoogsteNr = tm.volgNr;
            }
        });
        return hoogsteNr + 1;
    }

    get verId() {
        return this.verenigingForm?.get('verId');
    }
    get verKnbbId() {
        return this.verenigingForm?.get('verKnbbId');
    }
    get verNaam() {
        return this.verenigingForm?.get('verNaam');
    }
    get verLokatie() {
        return this.verenigingForm?.get('verLokatie');
    }
    get verKorteNaam() {
        return this.verenigingForm?.get('verKorteNaam');
    }
    get verLocatie() {
        return this.verenigingForm?.get('verLocatie');
    }

    get teamVolgNr() {
        return this.teamForm?.get('teamVolgNr');
    }
    get teamNaam() {
        return this.teamForm?.get('teamNaam');
    }
}
