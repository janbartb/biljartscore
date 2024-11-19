import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { List } from '../../../model/list';
import { SpelerWrapper } from '../../../model/speler';
import { BaseComponent } from '../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { KnbbCompetitie, KnbbCompTeam } from '../../../model/knbb-competitie';
import { MatchSpeler, MatchSpelerStand, MatchTeam, TeamMatch } from '../../../model/match';
import { NgClass } from '@angular/common';
import { Button } from '../../../model/button';
import { FormsModule } from '@angular/forms';
import { HelperService } from '../../../services/helper.service';
import { Team, Vereniging } from '../../../model/vereniging';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { Scrolling } from '../../../model/scrolling';

class CompTeam {
    key: KnbbCompTeam = new KnbbCompTeam('', '');
    data: Team = new Team();

    constructor(team: Team) {
        this.key = new KnbbCompTeam(team.verId, team.teamId);
        this.data = team;
    }
}

@Component({
    selector: 'app-knbb-team-match-setup',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
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
    compTitle: string = '';
    idxTeam: number = -1;
    idxSpeler: number = -1;
    activeSection: number = 0;
    competitie: KnbbCompetitie = new KnbbCompetitie();
    verenigingen: Vereniging[] = [];
    match: TeamMatch = new TeamMatch();
    activeMatchTeam: MatchTeam = new MatchTeam();
    otherMatchTeam: MatchTeam = new MatchTeam();
    teamLijst: List<CompTeam> = new List<CompTeam>();
    spelerLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    spelers: SpelerWrapper[] = [];
    klasse: string = '';
    escapeCount: number = 0;
    dataReady: boolean = false;
    inputValid: boolean = false;
    teamChanged: boolean = false;

    sectionButtons: Button[] = [new Button('Enter', 'Selecteer', true)];
    pageButtons: Button[] = [
        new Button('Backspace', 'Reset', true),
        new Button('Ctrl+Enter', 'Ga verder', true)
    ];

    scrollElmTeams!: HTMLDivElement;
    teamScrolling!: Scrolling;
    scrollElmLeden!: HTMLDivElement;
    ledenScrolling!: Scrolling;

    htmlTeamLijst = viewChild<ElementRef<HTMLDivElement>>('teamlijst');
    htmlLedenLijst = viewChild<ElementRef<HTMLDivElement>>('ledenlijst');

    constructor() {
        super();
        effect(() => {
            this.htmlTeamLijst()?.nativeElement;
            this.htmlLedenLijst()?.nativeElement;
        });
    }

    override escapePressed(): void {
        if (this.activeSection == 0) {
            if (this.idxTeam == 0) {
                this.router.navigate(['teammatch/setup/comp']);
            }
            else {
                this.router.navigate(['teammatch/setup/thuis']);
            }
        }
        this.activeSection--;
        this.setEscapeCount();
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

    pageButtonClicked(idx: number) {
        if (idx == 0) {
            this.resetClicked();
        }
        else if (idx == 1) {
            this.gaVerderClicked();
        }
    }

    enterSelectClicked() {
        if (this.activeSection == 0) {
            this.teamClicked(this.teamLijst.hoveredIdx);
        }
        else if (this.activeSection == 1) {
            this.spelerClicked(this.spelerLijst.hoveredIdx);
        }
    }

    teamClicked(idx: number, fromInit?: boolean) {
        if (idx < 0) {
            return;
        }
        if (idx == this.teamLijst.selectedIdx && !fromInit) {
            this.activeSection = 1;
            this.setEscapeCount();
            return;
        }
        this.teamLijst.selectedIdx = this.teamLijst.hoveredIdx = idx;
        let teamToAdd = this.teamLijst.filtered[this.teamLijst.selectedIdx];
        if (!fromInit || teamToAdd.key.verId != this.activeMatchTeam.verId || teamToAdd.key.teamId != this.activeMatchTeam.teamId) {
            this.activeMatchTeam = new MatchTeam();
            this.activeMatchTeam.teamId = teamToAdd.key.teamId;
            this.activeMatchTeam.teamNaam = teamToAdd.data.naam;
            this.activeMatchTeam.verId = teamToAdd.key.verId;
            this.activeMatchTeam.klasse = teamToAdd.data.klasse;
            this.idxSpeler = 0;
            this.teamChanged = true;
        }
        let lijst: SpelerWrapper[] = [];
        let team = this.teamLijst.filtered[idx];
        team.data.teamLeden.forEach(lidId => {
            const index = this.spelers.findIndex(s => s.speler.id == lidId);
            if (index >= 0) {
                lijst.push(this.spelers[index]);
            }
        });
        lijst.sort(this.compareSpelers);
        this.spelerLijst.fillItems(lijst);
        if (this.spelerLijst.isFilled()) {
            this.activeSection = 1;
            this.spelerLijst.hoveredIdx = 0;
        }
        else {
            this.activeSection = 0;
        }
        this.setEscapeCount();
    }

    spelerClicked(idx: number) {
        this.spelerLijst.selectedIdx = this.spelerLijst.hoveredIdx = idx;
        let spelerToAdd = this.spelerLijst.filtered[idx];
        let targetSpeler = this.activeMatchTeam.spelers[this.idxSpeler];
        if (spelerToAdd.speler.id == targetSpeler.splId) {
            this.maakVolgendeSpelerActief();
            return;
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
        this.teamChanged = false;
        this.initScreen();
        this.setEscapeCount();
    }

    gaVerderClicked() {
        if (this.teamChanged) {
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
        this.setEscapeCount();
    }

    maakSpelerActief(idx: number) {
        this.idxSpeler = idx;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydownEvent(event: KeyboardEvent): boolean {
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            event.preventDefault();
            return false;
        }
        return true;
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
                if (this.activeSection == 2 || event.ctrlKey) {
                    this.maakVorigeSpelerActief();
                }
                else if (this.activeSection == 0) {
                    this.teamLijst.hoverPreviousItem();
                    this.teamScrolling.scrollUp(this.teamLijst.hoveredIdx);
                }
                else if (this.activeSection == 1) {
                    this.spelerLijst.hoverPreviousItem();
                    this.ledenScrolling.scrollUp(this.spelerLijst.hoveredIdx);
                }
                return false;
            }
            if (event.key === 'ArrowDown') {
                if (this.activeSection == 2 || event.ctrlKey) {
                    this.maakVolgendeSpelerActief();
                }
                else if (this.activeSection == 0) {
                    this.teamLijst.hoverNextItem();
                    this.teamScrolling.scrollDown(this.teamLijst.hoveredIdx);
                }
                else if (this.activeSection == 1) {
                    this.spelerLijst.hoverNextItem();
                    this.ledenScrolling.scrollDown(this.spelerLijst.hoveredIdx);
                }
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.buttonPressed(this.pageButtons[1]);
                return false;
            }
            if (this.activeSection < 3) {
                this.buttonPressed(this.sectionButtons[0]);
                return false;
            }
            return true;
        }
        if (event.key === 'Backspace') {
            this.buttonPressed(this.pageButtons[0]);
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
        this.pageButtons[1].text = this.idxTeam == 0 ? 'Naar GASTEN team' : 'Naar controle';
        this.klasse = this.appData.getKlasse();

        Promise.all([
            this.bssApi.getVerenigingen(),
            this.bssApi.getSpelersLijst(this.spelId),
            this.bssApi.getKnbbTeamMatch()
        ])
        .then(results => {
            this.verenigingen = results[0];
            this.spelers = results[1];
            if (results[2].gevonden) {
                this.match = results[2].match;
                console.log(this.match);
                this.bssApi.getKnbbCompetitie(this.appData.getSeizoen(), this.appData.getDistrict().disId, this.spelId, this.match.compId)
                .then(data => {
                    this.competitie = data;
                    this.compTitle = `Competitie ${data.klasse}-${data.volgNr} ${data.naam}`;
                    this.initScreen();
                    this.checkInput();
                    this.dataReady = true;
                    this.setupScrolling();
                })
                .catch(err => {
                    this.alert.showError(err);
                });
                return;
            }
            else {
                this.initMatchTeams();
            }
            this.initScreen();
            this.checkInput();
            this.dataReady = true;
            this.setupScrolling();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private setupScrolling() {
        setTimeout(() => {
            const elmT = this.htmlTeamLijst()?.nativeElement;
            if (elmT) {
                this.scrollElmTeams = elmT;
                new ResizeObserver(() => { 
                    this.initLijstScrolling(this.scrollElmTeams, 'teams');
                }).observe(this.scrollElmTeams);
            }
            const elmL = this.htmlLedenLijst()?.nativeElement;
            if (elmL) {
                this.scrollElmLeden = elmL;
                new ResizeObserver(() => { 
                    this.initLijstScrolling(this.scrollElmLeden, 'leden');
                }).observe(this.scrollElmLeden);
            }
        }, 500);
    }

    private initLijstScrolling(elm: HTMLDivElement, lijst: string) {
        if (elm) {
            if (lijst == 'teams') {
                this.teamLijst.hoveredIdx = this.teamLijst.selectedIdx >= 0 ? this.teamLijst.selectedIdx : 0;
                this.teamScrolling = new Scrolling(elm, elm.offsetHeight, this.teamLijst.filtered.length, this.teamLijst.selectedIdx);
                console.log('resize event - pos = ' + this.teamScrolling.scrollPos);
            }
            else {
                this.spelerLijst.hoveredIdx = this.spelerLijst.selectedIdx >= 0 ? this.spelerLijst.selectedIdx : 0;
                this.ledenScrolling = new Scrolling(elm, elm.offsetHeight, this.spelerLijst.filtered.length, this.spelerLijst.selectedIdx);
                console.log('resize event - pos = ' + this.ledenScrolling.scrollPos);
            }
        }
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
        this.fillTeamLijst();
        let idx = -1;
        if (this.activeMatchTeam.teamId == '') {
            if (this.idxTeam == 0) {
                // preselect team op basis van voorkeur vereniging
                const ver = this.appData.getConfig()?.vereniging;
                if (ver) {
                    idx = this.teamLijst.filtered.findIndex(ctm => ctm.key.verId == ver);
                    this.teamClicked(idx, true);
                }
            }
        }
        else {
            // preselect team op basis van het team in de match
            idx = this.teamLijst.filtered.findIndex(ctm => ctm.key.verId == this.activeMatchTeam.verId);
            this.teamClicked(idx, true);
        }
        this.idxSpeler = 0;
        if (idx < 0) {
            this.spelerLijst.clearSelection();
            this.teamLijst.clearSelection();
            this.activeSection = 0;
        }
    }

    private fillTeamLijst(): void {
        const teams: Team[] = this.helper.getCompetitieTeamsData(this.competitie, this.verenigingen);
        let compTeams: CompTeam[] = [];
        teams.forEach(tm => {
            compTeams.push(new CompTeam(tm));
        });
        compTeams.sort(this.compareTeams);
        this.teamLijst.fillItems(compTeams);
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

    private compareTeams(a: CompTeam, b: CompTeam): number {
        return (a.data.naam > b.data.naam) ? 1 : -1;
    }

    private setEscapeCount() {
        this.escapeCount = this.activeSection;
    }

    private saveMatchAndContinue() {
        console.log(this.match);
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
