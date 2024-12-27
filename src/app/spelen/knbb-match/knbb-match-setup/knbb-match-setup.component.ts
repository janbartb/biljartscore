import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { KnbbCompetitie, KnbbCompTeam } from '../../../model/knbb-competitie';
import { Team, Vereniging } from '../../../model/vereniging';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../../services/helper.service';
import { Match, MatchSpeler, MatchSpelerStand } from '../../../model/match';
import { List } from '../../../model/list';
import { SpelerWrapper } from '../../../model/speler';
import { Button } from '../../../model/button';
import { Scrolling } from '../../../model/scrolling';
import { BaseComponent } from '../../../base/base.component';

class CompTeam {
    key: KnbbCompTeam = new KnbbCompTeam('', '');
    data: Team = new Team();

    constructor(team: Team) {
        this.key = new KnbbCompTeam(team.verId, team.teamId);
        this.data = team;
    }
}

@Component({
    selector: 'app-knbb-match-setup',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './knbb-match-setup.component.html',
    styleUrl: './knbb-match-setup.component.css'
})
export class KnbbMatchSetupComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);

    subtitle: string = '';
    compTitle: string = '';
    idxSpeler: number = -1;
    activeSection: number = 0;
    competitie: KnbbCompetitie = new KnbbCompetitie();
    verenigingen: Vereniging[] = [];
    match: Match = new Match();
    activeMatchSpeler: MatchSpeler = new MatchSpeler();
    otherMatchSpeler: MatchSpeler = new MatchSpeler();
    selectedTeam: CompTeam = new CompTeam(new Team());
    teamLijst: List<CompTeam> = new List<CompTeam>();
    spelerLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    spelers: SpelerWrapper[] = [];
    klasse: string = '';
    escapeCount: number = 0;
    dataReady: boolean = false;
    inputValid: boolean = false;
    spelerChanged: boolean = false;

    sectionButtons: Button[] = [new Button('Enter', 'Selecteer', true)];
    pageButtons: Button[] = [
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
        if (this.escapeCount == 1) {
            this.resetClicked();
        }
        else {
            this.previousClicked();
        }
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

    previousClicked() {
        if (this.idxSpeler == 0) {
            this.router.navigate(['match/setup/comp']);
        }
        else {
            this.router.navigate(['match/setup/thuis']);
        }
    }

    pageButtonClicked() {
        this.gaVerderClicked();
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
        let lijst: SpelerWrapper[] = [];
        let team = this.teamLijst.filtered[idx];
        this.selectedTeam = team;
        if (this.selectedTeam.key.verId != this.activeMatchSpeler.verId || this.selectedTeam.key.teamId != this.activeMatchSpeler.teamId) {
            this.activeMatchSpeler = new MatchSpeler();
        }
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
        this.checkInput();
        this.setEscapeCount();
    }

    spelerClicked(idx: number) {
        this.spelerLijst.selectedIdx = this.spelerLijst.hoveredIdx = idx;
        let spelerToAdd = this.spelerLijst.filtered[idx];
        let targetSpeler = this.activeMatchSpeler;
        if (spelerToAdd.speler.id == targetSpeler.splId) {
            return;
        }
        targetSpeler.splId = spelerToAdd.speler.id;
        targetSpeler.splNaam = spelerToAdd.getNaam();
        targetSpeler.verId = this.selectedTeam.key.verId;
        targetSpeler.teamId = this.selectedTeam.key.teamId;
        targetSpeler.splBordNaam = spelerToAdd.speler.vnaam;
        targetSpeler.splSpreekNaam = spelerToAdd.speler.spreeknaam == '' ? spelerToAdd.speler.vnaam : spelerToAdd.speler.spreeknaam;
        targetSpeler.splTsGem = spelerToAdd.getGemiddeldeVanSpel();
        targetSpeler.splTsCar = 0;
        targetSpeler.metWit = this.idxSpeler == 0;
        this.clearScores(this.activeMatchSpeler);
        this.clearScores(this.otherMatchSpeler);
        this.checkInput();
        this.setEscapeCount();
    }

    resetClicked() {
        this.initScreen();
        this.setEscapeCount();
    }

    gaVerderClicked() {
        this.checkIfSpelerChanged();
        if (this.spelerChanged) {
            this.match.idxSpelerActief = 0;
            this.match.matchOver = false;
            this.match.spelers[this.idxSpeler] = this.activeMatchSpeler;
            this.match.spelers[this.idxSpeler == 0 ? 1 : 0] = this.otherMatchSpeler;
            this.saveMatchAndContinue();
        }
        else {
            const url = this.idxSpeler == 0 ? 'match/setup/gasten' : 'match/setup/check';
            this.router.navigate([url]);
        }
    }

    maakSectionActief(idx: number) {
        this.activeSection = idx;
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
                if (this.activeSection == 0) {
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
                if (this.activeSection == 0) {
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
                this.buttonPressed(this.pageButtons[0]);
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
        this.idxSpeler = (path && path == 'gasten') ? 1 : 0;
        this.subtitle = `Selectie ${this.idxSpeler == 0 ? 'THUIS' : 'GAST'} speler`;
        this.pageButtons[0].text = this.idxSpeler == 0 ? 'Naar GASTEN team' : 'Naar controle';
        this.klasse = this.appData.getKlasse();

        Promise.all([
            this.bssApi.getVerenigingen(),
            this.bssApi.getSpelersLijst(this.spelId),
            this.bssApi.getKnbbMatch()
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
                this.router.navigate(['match/setup/comp']);
            }
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
        this.inputValid = this.activeMatchSpeler.splId != '';
    }

    private checkIfSpelerChanged() {
        this.spelerChanged = this.activeMatchSpeler.splId != this.match.spelers[this.idxSpeler].splId;
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

    private initScreen() {
        this.activeMatchSpeler = this.copySpeler(this.match.spelers[this.idxSpeler]);
        this.otherMatchSpeler = this.copySpeler(this.match.spelers[this.idxSpeler == 0 ? 1 : 0]);
        this.fillTeamLijst();
        let idx = -1;
        if (this.activeMatchSpeler.teamId == '') {
            // preselect team op basis van voorkeur vereniging
            const ver = this.appData.getConfig()?.vereniging;
            if (ver) {
                idx = this.teamLijst.filtered.findIndex(ctm => ctm.key.verId == ver);
                this.teamClicked(idx);
            }
        }
        else {
            // preselect team op basis van het team in de match
            idx = this.teamLijst.filtered.findIndex(ctm => ctm.key.verId == this.activeMatchSpeler.verId && ctm.key.teamId == this.activeMatchSpeler.teamId);
            this.teamClicked(idx, true);
        }
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

    private copySpeler(spl: MatchSpeler): MatchSpeler {
        return JSON.parse(JSON.stringify(spl));
    }

    private clearScores(spl: MatchSpeler) {
        spl.isActief = false;
        spl.stand = new MatchSpelerStand();
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
        this.checkIfSpelerChanged();
        this.escapeCount = this.spelerChanged ? 1 : 0;
    }

    private saveMatchAndContinue() {
        this.bssApi.saveKnbbMatch(this.match)
        .then(() => {
            const url = this.idxSpeler == 0 ? 'match/setup/gasten' : 'match/setup/check';
            this.router.navigate([url]);
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

}
