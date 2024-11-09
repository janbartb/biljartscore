import { Component, HostListener, inject, OnInit } from '@angular/core';
import { List } from '../../../model/list';
import { VerenigingKort } from '../../../model/vereniging';
import { SpelerWrapper } from '../../../model/speler';
import { BaseComponent } from '../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { KnbbCompetitie, KnbbCompTeam } from '../../../model/knbb-competitie';
import { MatchSpeler, MatchSpelerStand, MatchTeam, TeamMatch } from '../../../model/match';
import { NgClass } from '@angular/common';
import { Button } from '../../../model/button';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { FormsModule } from '@angular/forms';
import { HelperService } from '../../../services/helper.service';
import { MoyenneTabel } from '../../../model/moyenne-tabel';

@Component({
    selector: 'app-knbb-team-match-setup',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ButtonComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './knbb-team-match-setup.component.html',
    styleUrl: './knbb-team-match-setup.component.css'
})
export class KnbbTeamMatchSetupComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);

    subtitle: string = '';
    idxTeam: number = -1;
    idxSpeler: number = -1;
    activeSection: number = 0;
    match: TeamMatch = new TeamMatch();
    activeComp: KnbbCompetitie = new KnbbCompetitie();
    activeMatchTeam: MatchTeam = new MatchTeam();
    otherMatchTeam: MatchTeam = new MatchTeam();
    compLijst: List<KnbbCompetitie> = new List<KnbbCompetitie>();
    teamLijst: List<KnbbCompTeam> = new List<KnbbCompTeam>();
    spelerLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    spelers: SpelerWrapper[] = [];
    compFilter: string = '';
    klasse: string = '';
    dataReady: boolean = false;
    inputValid: boolean = false;
    teamChanged: boolean = false;

    enterButton: Button = new Button('Ctrl+Enter', 'Ga verder', true);
    resetButton: Button = new Button('Backspace', 'Reset', true);
    enterSelectButton: Button = new Button('Enter', 'Selecteer', true);

    override escapePressed(): void {
        if (this.activeSection == 0) {
            if (this.idxTeam == 0) {
                this.router.navigate(['spelkeuze']);
            }
            else {
                this.router.navigate(['teammatch/setup/thuis']);
            }
        }
        this.activeSection--;
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.enterSelectClicked();
            }
            else if (button.key == 'Backspace') {
                this.resetClicked();
            }
            else if (button.key == 'Ctrl+Enter') {
                this.gaVerderClicked();
            }
        }, 300);
    }

    enterSelectClicked() {
        if (this.activeSection == 0) {
            this.competitieClicked(this.compLijst.hoveredIdx);
        }
        else if (this.activeSection == 1) {
            this.teamClicked(this.teamLijst.hoveredIdx);
        }
        else if (this.activeSection == 2) {
            this.spelerClicked(this.spelerLijst.hoveredIdx);
        }
    }

    competitieClicked(idx: number, fromInit?: boolean) {
        if (idx == this.compLijst.selectedIdx && !fromInit) {
            this.activeSection = 1;
            return;
        }
        this.compLijst.selectedIdx = this.compLijst.hoveredIdx = idx;
        this.activeComp = this.compLijst.filtered[idx];
        this.teamLijst = new List<KnbbCompTeam>();
        if (this.activeComp.teams.length) {
            this.activeComp.teams.sort(this.compareTeams);
            this.teamLijst.fillItems(this.activeComp.teams);
            // preselect team op basis van team in match
            let teamSelected = this.teamLijst.filtered.some((team, idx) => {
                if (team.verId == this.activeMatchTeam.verId && team.teamId == this.activeMatchTeam.teamId) {
                    this.teamClicked(idx, fromInit);
                    return true;
                }
                return false;
            });
            if (!teamSelected && this.idxTeam == 0) {
                // preselect team op basis van voorkeursvereniging
                teamSelected = this.teamLijst.filtered.some((team, idx) => {
                    if (team.verId == this.appData.getConfig()?.vereniging) {
                        this.teamClicked(idx, fromInit);
                        return true;
                    }
                    return false;
                });
            }
            if (!teamSelected) {
                // preselect het eerste team
                this.teamClicked(0, fromInit);
            }
        }
    }

    teamClicked(idx: number, fromInit?: boolean) {
        if (idx == this.teamLijst.selectedIdx && !fromInit) {
            this.activeSection = 2;
            return;
        }
        this.teamLijst.selectedIdx = this.teamLijst.hoveredIdx = idx;
        let lijst: SpelerWrapper[] = [];
        let team = this.teamLijst.filtered[idx];
        team.spelers.forEach(spl => {
            const index = this.spelers.findIndex(s => s.speler.id == spl.splId);
            if (index >= 0) {
                lijst.push(this.spelers[index]);
            }
        });
        lijst.sort(this.compareSpelers);
        this.spelerLijst.fillItems(lijst);
        if (this.spelerLijst.isFilled()) {
            this.activeSection = 2;
            this.spelerLijst.hoveredIdx = 0;
        }
        else {
            this.activeSection = 1;
        }
    }

    spelerClicked(idx: number) {
        this.spelerLijst.selectedIdx = this.spelerLijst.hoveredIdx = idx;
        let spelerToAdd = this.spelerLijst.filtered[idx];
        let targetSpeler = this.activeMatchTeam.spelers[this.idxSpeler];
        if (spelerToAdd.speler.id == targetSpeler.splId) {
            this.maakVolgendeSpelerActief();
            return;
        }
        let teamToAdd = this.teamLijst.filtered[this.teamLijst.selectedIdx];
        if (!(teamToAdd.verId == this.activeMatchTeam.verId && teamToAdd.teamId == this.activeMatchTeam.teamId)) {
            this.activeMatchTeam = new MatchTeam();
            this.activeMatchTeam.teamId = teamToAdd.teamId;
            this.activeMatchTeam.teamNaam = teamToAdd.naam;
            this.activeMatchTeam.verId = teamToAdd.verId;
            this.activeMatchTeam.klasse = teamToAdd.klasse;
            targetSpeler = this.activeMatchTeam.spelers[this.idxSpeler];
        }
        targetSpeler.splId = spelerToAdd.speler.id;
        targetSpeler.splNaam = spelerToAdd.getNaam();
        targetSpeler.splBordNaam = spelerToAdd.speler.vnaam;
        targetSpeler.splSpreekNaam = spelerToAdd.speler.spreeknaam == '' ? spelerToAdd.speler.vnaam : spelerToAdd.speler.spreeknaam;
        targetSpeler.splTsGem = spelerToAdd.getGemiddeldeVanSpel();
        targetSpeler.splTsCar = 0;
        targetSpeler.metWit = this.idxTeam == 0;
        this.teamChanged = true;
        this.clearScores(this.activeMatchTeam);
        this.clearScores(this.otherMatchTeam);
        this.maakVolgendeSpelerActief();
        this.checkInput();
    }

    resetClicked() {
        this.activeMatchTeam = this.copyTeam(this.match.teams[this.idxTeam]);
        this.otherMatchTeam = this.copyTeam(this.match.teams[this.idxTeam == 0 ? 1 : 0]);
        this.teamChanged = false;
        this.initScreen();
    }

    gaVerderClicked() {
        if (this.teamChanged || this.match.compId != this.activeComp.competitieId) {
            if (this.match.compId != this.activeComp.competitieId) {
                this.match.compId = this.activeComp.competitieId
                this.match.klasse = this.activeComp.klasse;
                this.match.maxBeurten = this.activeComp.maxBeurten;
            }
            this.match.idxTeamActief = 0;
            this.match.idxWedActief = 0;
            this.match.matchOver = false;
            this.match.gameOver = [false, false, false];
            this.sortTeamSpelers();
            this.match.teams[this.idxTeam] = this.activeMatchTeam;
            this.match.teams[this.idxTeam == 0 ? 1 : 0] = this.otherMatchTeam;
            this.saveMatchAndContinue();
        }
        else {
            const url = this.idxTeam == 0 ? 'teammatch/setup/gasten' : 'teammatch/setup/check';
            this.router.navigate([url]);
        }
    }

    maakSectionActief(idx: number) {
        this.activeSection = idx;
    }

    maakSpelerActief(idx: number) {
        this.idxSpeler = idx;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowLeft' || event.key ==='ArrowRight') {
            this.veranderActieveSectie(event.key ==='ArrowLeft' ? -1 : 1)
            return false;
        }
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                if (this.activeSection == 0) {
                    this.compLijst.hoverPreviousItem();
                }
                else if (this.activeSection == 1) {
                    this.teamLijst.hoverPreviousItem();
                }
                else if (this.activeSection == 2) {
                    this.spelerLijst.hoverPreviousItem();
                }
                else if (this.activeSection == 3 || event.ctrlKey) {
                    this.maakVorigeSpelerActief();
                }
                return false;
            }
            if (event.key === 'ArrowDown') {
                if (this.activeSection == 0) {
                    this.compLijst.hoverNextItem();
                }
                else if (this.activeSection == 1) {
                    this.teamLijst.hoverNextItem();
                }
                else if (this.activeSection == 2) {
                    this.spelerLijst.hoverNextItem();
                }
                else if (this.activeSection == 3 || event.ctrlKey) {
                    this.maakVolgendeSpelerActief();
                }
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.buttonPressed(this.enterButton);
                return false;
            }
            if (this.activeSection < 3) {
                this.buttonPressed(this.enterSelectButton);
                return false;
            }
            return true;
        }
        if (event.key === 'Backspace') {
            this.buttonPressed(this.resetButton);
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
        const path = this.route.snapshot.routeConfig?.path;
        this.idxTeam = (path && path == 'gasten') ? 1 : 0;
        this.idxSpeler = 0;
        this.subtitle = `Selectie spelers ${this.idxTeam == 0 ? 'THUIS' : 'GASTEN'} team`;
        this.enterButton.text = this.idxTeam == 0 ? 'Naar GASTEN team' : 'Naar controle';
        this.klasse = this.appData.getKlasse();

        Promise.all([
            this.bssApi.getKnbbCompetities(this.appData.getSeizoen(), this.appData.getDistrict().disId, this.spelId),
            this.bssApi.getSpelersLijst(this.spelId),
            this.bssApi.getKnbbTeamMatch()
        ])
        .then(results => {
            results[0].sort(this.compareCompetities);
            this.compLijst.fillItems(results[0]);
            this.spelers = results[1];
            if (results[2].gevonden) {
                this.match = results[2].match;
                if (this.idxTeam == 1) {
                    this.compLijst.filter((cmp) => cmp.competitieId == this.match.compId);
                }
            }
            else {
                this.initMatchTeams();
            }
            this.initScreen();
            this.checkInput();
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private checkInput() {
        this.inputValid = this.activeMatchTeam.spelers.every(spl => spl.splId != '');
    }

    private checkTeamChanged() {
        this.teamChanged = this.activeMatchTeam.spelers.some((spl, idx) => {
            return spl.splId != this.match.teams[this.idxTeam].spelers[idx].splId;
        });
    }

    private veranderActieveSectie(direction: number) {
        let idx = this.activeSection;
        idx += direction;
        if (idx < 0) {
            idx = 3;
        }
        if (idx > 3) {
            idx = 0;
        }
        this.maakSectionActief(idx);
    }

    private maakVorigeSpelerActief() {
        let idxSpl = this.idxSpeler;
        idxSpl--;
        if (idxSpl < 0) {
            idxSpl = 2;
        }
        this.maakSpelerActief(idxSpl);
    }

    private maakVolgendeSpelerActief() {
        let idxSpl = this.idxSpeler;
        idxSpl++;
        if (idxSpl > 2) {
            idxSpl = 0;
        }
        this.maakSpelerActief(idxSpl);
    }

    private initScreen() {
        this.activeMatchTeam = this.copyTeam(this.match.teams[this.idxTeam]);
        this.otherMatchTeam = this.copyTeam(this.match.teams[this.idxTeam == 0 ? 1 : 0]);
        let compSelected = false;
        if (this.match.compId == '') {
            compSelected = this.initScreenForEmptyMatch();
        }
        else {
            compSelected = this.initScreenForFilledMatch();
        }
        if (!compSelected) {
            this.spelerLijst.clearSelection();
            this.teamLijst.clearSelection();
            this.compLijst.clearSelection();
            this.activeSection = 0;
        }
    }

    private initScreenForFilledMatch(): boolean {
        // preselect competitie op basis van compId in match
        return this.compLijst.filtered.some((cmp, idx) => {
            if (cmp.competitieId == this.match.compId) {
                this.competitieClicked(idx, true);
                return true;
            }
            return false;
        });
    }

    private initScreenForEmptyMatch(): boolean {
        // preselect competitie op basis van voorkeursklasse
        return this.compLijst.filtered.some((cmp, idx) => {
            if (cmp.klasse == this.klasse) {
                this.competitieClicked(idx, true);
                return true;
            }
            return false;
        });
    }

    private copyTeam(team: MatchTeam): MatchTeam {
        return JSON.parse(JSON.stringify(team));
    }

    private clearScores(team: MatchTeam) {
        team.spelers.forEach(spl => {
            spl.isActief = false;
            spl.stand = new MatchSpelerStand();
        });
    }

    private initMatchTeams() {
        if (this.match.teams.length) {
            return;
        }
        this.match.teams.push(new MatchTeam());
        this.match.teams.push(new MatchTeam());
    }

    sortTeamSpelers() {
        this.activeMatchTeam.spelers.sort(this.compareTeamSpelers);
        this.idxSpeler = 0;
    }

    private compareTeamSpelers(a: MatchSpeler, b: MatchSpeler): number {
        if (a.splTsGem == b.splTsGem) {
            return (a.splNaam > b.splNaam) ? 1 : -1;
        }
        else {
            return a.splTsGem - b.splTsGem; 
        }
    }

    private compareSpelers(a: SpelerWrapper, b: SpelerWrapper): number {
        if (a.getGemiddeldeVanSpel() == b.getGemiddeldeVanSpel()) {
            return (a.getNaam() > b.getNaam()) ? 1 : -1;
        }
        else {
            return b.getGemiddeldeVanSpel() - a.getGemiddeldeVanSpel(); 
        }
    }

    private compareTeams(a: KnbbCompTeam, b: KnbbCompTeam): number {
        return (a.naam > b.naam) ? 1 : -1;
    }

    private compareCompetities(a: KnbbCompetitie, b: KnbbCompetitie): number {
        if (a.klasse == b.klasse) {
            if (a.volgNr == b.volgNr) {
                if (a.poule == b.poule) {
                    return (a.naam < b.naam) ? 1 : -1;
                }
                return a.poule - b.poule;
            }
            return a.volgNr - b.volgNr;
        }
        return (a.klasse > b.klasse) ? 1 : -1;
    }

    private saveMatchAndContinue() {
        this.bssApi.saveKnbbTeamMatch(this.match)
        .then(() => {
            const url = this.idxTeam == 0 ? 'teammatch/setup/gasten' : 'teammatch/setup/check';
            this.router.navigate([url]);
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

}
