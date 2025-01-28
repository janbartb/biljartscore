import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { BpCompetitie, BpLokaliteit, BpTeam, TeamPageData, TeamPageSpeler } from '../../../../model/bpoint';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { Lokaliteit, Team, Vereniging } from '../../../../model/vereniging';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates, notEmpty } from '../../../../directives/validators.directive';
import { DecimalPipe, NgClass } from '@angular/common';
import { Button } from '../../../../model/button';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';
import { Speler, SpelerGemiddelde, SpelerWrapper } from '../../../../model/speler';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';
import { KnbbCompetitie, KnbbCompTeam } from '../../../../model/knbb-competitie';
import { ButtonComponent } from '../../../../shared/button-group/button/button.component';

class SpelerToProcess {
    inBSS: boolean = false;
    inBp: boolean = false;
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
        ButtonComponent,
        ReactiveFormsModule,
        FormsModule,
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
    bssLokaliteiten: Lokaliteit[] = [];
    bssLokaliteit: Lokaliteit = new Lokaliteit();
    bssTeam: Team = new Team();
    bssTeamId: string = '';
    bssTeamIdOk: boolean = true;
    bssTeamSpelersOk: boolean = false;
    spelersToProcess: SpelerToProcess[] = [];
    spelersToAdd: Speler[] = [];
    spelersToUpd: Speler[] = [];
    allSpelers: SpelerWrapper[] = [];
    existingLokIds: string[] = [];
    existingVerIds: string[] = [];
    existingTeamIds: string[] = [];
    existingSpelerIds: string[] = [];
    subtitle: string = '';
    sectionTitle: string = '';
    escapeCount: number = 0;
    dataReady: boolean = false;

    lokaliteitForm!: FormGroup | null;
    verenigingForm!: FormGroup | null;
    teamForm!: FormGroup | null;
    verButton: Button = new Button('', 'Nieuwe vereniging', false);
    lokButtons: Button[] = [new Button('', 'Lokaliteit toevoegen')]
    teamButtons: Button[] = [new Button('', 'Team toevoegen', false)];
    splButtons: Button[] = [
        new Button('', 'Spelers verwerken in BSS', false)
    ];

    teamToevoegen() {
        if (this.bssVereniging.verId == '') {
            this.verenigingEnTeamToevoegen();
        }
        else if (this.bssTeam.teamId == '') {
            this.teamToevoegenAanVereniging();
        }
        else {
            this.teamAanCompetitieToevoegen();
        }
    }

    private verenigingEnTeamToevoegen() {
        this.bssVereniging = new Vereniging();
        this.bssVereniging.verId = this.verId?.value;
        this.bssVereniging.naam = this.verNaam?.value;
        this.bssVereniging.korteNaam = this.verKorteNaam?.value;
        this.bssVereniging.locatie = this.verLokatie?.value;
        
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
            this.bssVerenigingen.push(this.bssVereniging);
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
            this.bpTeam.inBssComp = true;
            localStorage.setItem('bpTeam', JSON.stringify(this.bpTeam));
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
            this.bpTeam.inBssComp = true;
            localStorage.setItem('bpTeam', JSON.stringify(this.bpTeam));
            this.initialize();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    lokaliteitToevoegen() {
        this.bssLokaliteit = new Lokaliteit();
        this.bssLokaliteit.lokId = this.lokId?.value;
        this.bssLokaliteit.knbbId = this.lokKnbbId?.value;
        this.bssLokaliteit.naam = this.lokNaam?.value;
        this.bssLokaliteit.adres = this.lokAdres?.value;
        this.bssLokaliteit.postcode = this.lokPostcode?.value;
        this.bssLokaliteit.plaats = this.lokPlaats?.value;
        this.bssLokaliteit.telefoon = this.lokTelefoon?.value;
        this.bssLokaliteit.email = this.lokEmail?.value;
        this.bssApi.addLokaliteit(this.bssLokaliteit)
        .then(resp => {
            this.alert.showAlert(`Lokaliteit '${this.bssLokaliteit.naam}' is toegevoegd aan BSS.`, 'success');
            this.existingLokIds.push(this.bssLokaliteit.lokId);
            this.initialize();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    nieuweVerenigingClicked() {
        this.bssVerenigingen = [];
        this.bssVereniging = new Vereniging();
        this.existingTeamIds = this.bssVereniging.teams.map(tm => tm.teamId);
        this.bssTeam = this.getBssTeamEnVereniging(this.bssVerenigingen, this.bpTeam.knbbId);
        this.initialize();
    }

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

    bssVerenigingChanged() {

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
            this.bssApi.getSpelersLijst('3BA'),
            this.bssApi.getLokaliteiten()
        ])
        .then(results => {
            this.pageData = results[0];
            const lokdat = this.pageData.lokData.replaceAll('\t', '');
            const lokdatArr = lokdat.split('\n');
            console.log(lokdatArr);
            this.pageData.spelers.forEach(spl => {
                spl.splNaam = spl.splNaam.replaceAll('*', '');
            });
            this.allSpelers = results[2];
            this.existingSpelerIds = this.allSpelers.map(sw => sw.speler.id);
            const pos = lokdatArr[0].indexOf(' ');
            this.bpLokaliteit.knbbId = lokdatArr[0].substring(0, pos);
            this.bpLokaliteit.naam = lokdatArr[0].substring(pos + 1);
            this.bpLokaliteit.adres = lokdatArr[2].trim() + ' ' + lokdatArr[3].trim();
            this.bpLokaliteit.postcode = lokdatArr[4].trim();
            let plaats = lokdatArr[5].toLowerCase().trim();
            this.bpLokaliteit.plaats = plaats.substring(0, 1).toUpperCase() + plaats.substring(1);
            if (lokdatArr.length > 6) {
                this.bpLokaliteit.telefoon = lokdatArr[6].trim();
            }
            if (lokdatArr.length > 7) {
                this.bpLokaliteit.email = lokdatArr[7].trim();
            }
            this.existingVerIds = results[1].map(ver => ver.verId);
            this.bssLokaliteiten = results[3];
            this.existingLokIds = this.bssLokaliteiten.map(lok => lok.lokId);
            this.bssLokaliteit = this.getBssLokaliteit(this.bssLokaliteiten, this.bpLokaliteit.knbbId);
            this.bssVerenigingen = this.getBssVerenigingenVanLokaliteit(results[1], this.bssLokaliteit.lokId);
            this.existingTeamIds = this.bssVereniging.teams.map(tm => tm.teamId);
            this.bssTeam = this.getBssTeamEnVereniging(this.bssVerenigingen, this.bpTeam.knbbId);
            if (this.bssVereniging.verId == '' && this.bssVerenigingen.length > 0) {
                this.bssVereniging = this.bssVerenigingen[0];
            }
            this.initialize();
        })
        .catch(err => {
            console.log(err);
            this.alert.showError(err);
        });
    }

    private initialize() {
        this.lokaliteitForm = null;
        this.verenigingForm = null;
        this.teamForm = null;
        this.spelersToProcess = [];
        if (this.bssLokaliteit.lokId == '') {
            this.sectionTitle = 'Lokaliteit toevoegen aan BSS';
            this.createLokaliteitForm(this.bpLokaliteit);
        }
        else {
            if (this.bssVerenigingen.length == 0) {
                this.sectionTitle = 'Team toevoegen in BSS';
                this.createVerenigingForm();
                this.createTeamForm(this.bpTeam, this.bpComp);
            }
            else {
                if (this.bssTeam.teamId == '') {
                    this.sectionTitle = 'Team toevoegen in BSS';
                    this.createTeamForm(this.bpTeam, this.bpComp);
                }
                else {
                    if (!this.bpTeam.inBssComp) {
                        this.sectionTitle = 'Team toevoegen in BSS';
                    }
                    else {
                        console.log(this.pageData);
                        this.sectionTitle = 'Te verwerken spelers';
                        this.spelersToProcess = this.getSpelersToProcess();
                        console.log(this.spelersToProcess);
                        let bpTeamSpelers = this.spelersToProcess.filter(sp => sp.inBp).map(sp => sp.bssSpeler.speler.id);
                        bpTeamSpelers.sort();
                        let bssTeamSpelers: String[] = JSON.parse(JSON.stringify(this.bssTeam.teamLeden));
                        bssTeamSpelers.sort();
                        this.bssTeamSpelersOk = JSON.stringify(bpTeamSpelers) == JSON.stringify(bssTeamSpelers);
                        this.fillSpelersToAddOrUpdate();
                    }
                }    
            }    
        }
        this.dataReady = true;
    }

    private fillSpelersToAddOrUpdate() {
        this.spelersToAdd = [];
        this.spelersToUpd = [];
        this.spelersToProcess.filter(spl => spl.inBp).forEach(spl => {
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

    private getBssLokaliteit(lokaliteiten: Lokaliteit[], knbbId: string): Lokaliteit {
        let foundLokaliteit = lokaliteiten.find(lok => lok.knbbId == knbbId);
        return foundLokaliteit ? foundLokaliteit : new Lokaliteit();
    }

    private getBssVerenigingenVanLokaliteit(verenigingen: Vereniging[], lokId: string): Vereniging[] {
        if (lokId == '') {
            return [];
        }
        let foundVerenigingen = verenigingen.filter(ver => ver.locatie == lokId);
        if (this.bpTeam.bssVerId != '') {
            const foundVereniging = verenigingen.find(ver => ver.verId == this.bpTeam.bssVerId);
            if (foundVereniging) {
                foundVerenigingen = [foundVereniging];
            }
        }
        return foundVerenigingen;
    }

    private getBssTeamEnVereniging(verenigingen: Vereniging[], knbbId: string): Team {
        let result = new Team();
        verenigingen.forEach(ver => {
            if (result.teamId == '') {
                const foundTeam = ver.teams.find(tm => tm.knbbId == knbbId);
                if (foundTeam) {
                    result = foundTeam;
                    this.bssVereniging = ver;
                }
            }
        });
        return result;
    }

    private createLokaliteitForm(lokaliteit: BpLokaliteit) {
        this.lokaliteitForm = this.fb.nonNullable.group({
            lokId: [this.createVerenigingId(this.bpLokaliteit.naam), [Validators.required, notEmpty(), noDuplicates(this.existingLokIds)]],
            lokKnbbId: [lokaliteit.knbbId, [Validators.required, notEmpty()]],
            lokNaam: [lokaliteit.naam, [Validators.required, notEmpty()]],
            lokAdres: [lokaliteit.adres],
            lokPostcode: [lokaliteit.postcode],
            lokPlaats: [lokaliteit.plaats],
            lokTelefoon: [lokaliteit.telefoon],
            lokEmail: [lokaliteit.email],
        });
    }

    private createVerenigingForm() {
        this.verenigingForm = this.fb.nonNullable.group({
            verId: [this.createVerenigingId(this.bssLokaliteit.naam), [Validators.required, notEmpty(), noDuplicates(this.existingVerIds)]],
            verNaam: [this.bssLokaliteit.naam, [Validators.required, notEmpty()]],
            verLokatie: [this.bssLokaliteit.lokId],
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
            spelerToProcess.inBp = true;
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
        this.existingSpelerIds.push(speler.id);
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

    get lokId() {
        return this.lokaliteitForm?.get('lokId');
    }
    get lokKnbbId() {
        return this.lokaliteitForm?.get('lokKnbbId');
    }
    get lokNaam() {
        return this.lokaliteitForm?.get('lokNaam');
    }
    get lokAdres() {
        return this.lokaliteitForm?.get('lokAdres');
    }
    get lokPostcode() {
        return this.lokaliteitForm?.get('lokPostcode');
    }
    get lokPlaats() {
        return this.lokaliteitForm?.get('lokPlaats');
    }
    get lokTelefoon() {
        return this.lokaliteitForm?.get('lokTelefoon');
    }
    get lokEmail() {
        return this.lokaliteitForm?.get('lokEmail');
    }

    get verId() {
        return this.verenigingForm?.get('verId');
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

    get teamVolgNr() {
        return this.teamForm?.get('teamVolgNr');
    }
    get teamNaam() {
        return this.teamForm?.get('teamNaam');
    }
}
