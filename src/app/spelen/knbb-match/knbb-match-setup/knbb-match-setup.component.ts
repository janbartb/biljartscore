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
    matchSpelers: MatchSpeler[] = [];
    selectedTeam: CompTeam = new CompTeam(new Team());
    teamLijst: List<CompTeam> = new List<CompTeam>();
    spelerLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    spelers: SpelerWrapper[] = [];
    klasse: string = '';
    escapeCount: number = 0;
    dataReady: boolean = false;
    inputValid: boolean = false;
    spelersChanged: boolean = false;

    sectionButtons: Button[] = [new Button('Enter', 'Selecteer', true)];
    pageButtons: Button[] = [new Button('Enter', 'Naar controle', true)];

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
        if (this.teamLijst.hoveredIdx >= 0 || this.spelerLijst.hoveredIdx >= 0) {
            this.teamLijst.hoveredIdx = this.spelerLijst.hoveredIdx = -1;
            this.setEscapeCount();
            return;
        }
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
                if (this.teamLijst.hoveredIdx < 0 && this.spelerLijst.hoveredIdx < 0) {
                    if (this.inputValid) {
                        this.gaVerderClicked();
                    }
                }
                else {
                    this.enterSelectClicked();
                }
            }
        }, 300);
    }

    previousClicked() {
        this.router.navigate(['match/setup/comp']);
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
        this.teamLijst.selectedIdx = idx;
        this.teamLijst.hoveredIdx = -1;
        let lijst: SpelerWrapper[] = [];
        let team = this.teamLijst.filtered[idx];
        this.selectedTeam = team;
        if (this.selectedTeam.key.verId != this.matchSpelers[this.idxSpeler].verId || this.selectedTeam.key.teamId != this.matchSpelers[this.idxSpeler].teamId) {
            this.matchSpelers[this.idxSpeler] = new MatchSpeler();
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
            this.spelerLijst.hoveredIdx = -1;
        }
        else {
            this.activeSection = 0;
        }
        this.checkInput();
        this.setEscapeCount();
    }

    spelerClicked(idx: number) {
        this.spelerLijst.hoveredIdx = -1;
        let spelerToAdd = this.spelerLijst.filtered[idx];
        let targetSpeler = this.matchSpelers[this.idxSpeler];
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
        this.clearScores();
        this.checkInput();
        this.idxSpeler = (this.idxSpeler == 0) ? 1 : 0;
        this.setEscapeCount();
    }

    resetClicked() {
        this.initScreen();
        this.setEscapeCount();
    }

    gaVerderClicked() {
        this.checkIfSpelersChanged();
        if (this.spelersChanged) {
            this.match.idxSpelerActief = 0;
            this.match.matchOver = false;
            this.match.spelers = this.copySpelers(this.matchSpelers);
            this.saveMatchAndContinue();
        }
        else {
            this.router.navigate(['match/setup/check']);
        }
    }

    maakSectionActief(idx: number) {
        this.activeSection = idx;
        this.teamLijst.hoveredIdx = this.spelerLijst.hoveredIdx = -1;
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
                if (this.activeSection == 0) {
                    this.teamLijst.hoverPreviousItem();
                    this.teamScrolling.scrollUp(this.teamLijst.hoveredIdx);
                    this.setEscapeCount();
                }
                else if (this.activeSection == 1) {
                    this.spelerLijst.hoverPreviousItem();
                    this.ledenScrolling.scrollUp(this.spelerLijst.hoveredIdx);
                    this.setEscapeCount();
                }
                else if (this.activeSection == 2) {
                    this.idxSpeler = (this.idxSpeler == 0) ? 1 : 0;
                }
                return false;
            }
            if (event.key === 'ArrowDown') {
                if (this.activeSection == 0) {
                    this.teamLijst.hoverNextItem();
                    this.teamScrolling.scrollDown(this.teamLijst.hoveredIdx);
                    this.setEscapeCount();
                }
                else if (this.activeSection == 1) {
                    this.spelerLijst.hoverNextItem();
                    this.ledenScrolling.scrollDown(this.spelerLijst.hoveredIdx);
                    this.setEscapeCount();
                }
                else if (this.activeSection == 2) {
                    this.idxSpeler = (this.idxSpeler == 0) ? 1 : 0;
                }
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (this.teamLijst.hoveredIdx < 0 && this.spelerLijst.hoveredIdx < 0 && this.inputValid) {
                this.buttonPressed(this.pageButtons[0]);
                this.setEscapeCount();
                return false;
            }
            if (this.teamLijst.hoveredIdx >= 0 || this.spelerLijst.hoveredIdx >= 0) {
                this.buttonPressed(this.sectionButtons[0]);
                this.setEscapeCount();
                return false;
            }
            return true;
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
        this.idxSpeler = 0;
        this.subtitle = `Selectie spelers`;
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
                this.bssApi.getKnbbCompetitie(this.appData.getDistrict().disId, this.spelId, this.match.compId)
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
                this.teamScrolling = new Scrolling(elm, elm.offsetHeight, this.teamLijst.filtered.length, this.teamLijst.selectedIdx);
                console.log('resize event - pos = ' + this.teamScrolling.scrollPos);
            }
            else {
                this.ledenScrolling = new Scrolling(elm, elm.offsetHeight, this.spelerLijst.filtered.length, this.spelerLijst.selectedIdx);
                console.log('resize event - pos = ' + this.ledenScrolling.scrollPos);
            }
        }
    }

    private checkInput() {
        this.inputValid = this.matchSpelers.every(spl => spl.splId != '');
    }

    private checkIfSpelersChanged() {
        this.spelersChanged = this.matchSpelers.some((spl, idx) => spl.splId != this.match.spelers[idx].splId);
    }

    private veranderActieveSectie(direction: number) {
        let idx = this.activeSection;
        idx += direction;
        if (idx < 0) {
            idx = 2;
        }
        if (idx > 2) {
            idx = 0;
        }
        this.maakSectionActief(idx);
    }

    private initScreen() {
        this.idxSpeler = 0;
        this.matchSpelers = this.copySpelers(this.match.spelers);
        this.fillTeamLijst();
        let idx = -1;
        if (this.matchSpelers[0].teamId == '') {
            // preselect team op basis van voorkeur vereniging
            const ver = this.appData.getConfig()?.vereniging;
            if (ver) {
                idx = this.teamLijst.filtered.findIndex(ctm => ctm.key.verId == ver);
                this.teamClicked(idx);
            }
        }
        else {
            // preselect team op basis van het team in de match
            idx = this.teamLijst.filtered.findIndex(ctm => ctm.key.verId == this.matchSpelers[0].verId && ctm.key.teamId == this.matchSpelers[0].teamId);
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

    private copySpelers(splrs: MatchSpeler[]): MatchSpeler[] {
        return JSON.parse(JSON.stringify(splrs));
    }

    private clearScores() {
        this.matchSpelers.forEach(spl => {
            spl.isActief = false;
            spl.stand = new MatchSpelerStand();    
        });
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
        this.checkIfSpelersChanged();
        this.escapeCount = this.spelersChanged ? 1 : 0;
        if (this.teamLijst.hoveredIdx >= 0 || this.spelerLijst.hoveredIdx >= 0) {
            this.escapeCount++;
        }
    }

    private saveMatchAndContinue() {
        this.bssApi.saveKnbbMatch(this.match)
        .then(() => {
            this.router.navigate(['match/setup/check']);
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

}
