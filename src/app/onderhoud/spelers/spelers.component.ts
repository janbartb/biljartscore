import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild, ViewChild } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { Speler, SpelerWrapper } from '../../model/speler';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Team, Vereniging } from '../../model/vereniging';
import { List } from '../../model/list';
import { Button } from '../../model/button';
import { BaseComponent } from '../../base/base.component';
import { Spelsoort } from '../../model/spelsoort';
import { ApiResponse } from '../../model/api-response';
import { HelperService } from '../../services/helper.service';
import { Scrolling } from '../../model/scrolling';
import { ActivatedRoute } from '@angular/router';
import { KnbbCompetitie } from '../../model/knbb-competitie';
import { ButtonComponent } from "../../shared/button-group/button/button.component";
import { TeamPageData } from '../../model/bpoint';

@Component({
  selector: 'app-spelers',
  standalone: true,
  imports: [
    PageHeaderComponent,
    FormsModule,
    NgClass,
    DecimalPipe,
    ReactiveFormsModule,
    ButtonComponent
],
  templateUrl: './spelers.component.html',
  styleUrl: './spelers.component.css'
})
export class SpelersComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);
    route = inject(ActivatedRoute);

    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Spelers';
    fromVereniging: boolean = false;

    spelerList: List<SpelerWrapper> = new List<SpelerWrapper>();
    verenigingen: Vereniging[] = [];
    vereniging: Vereniging = new Vereniging();
    spelsoorten: Spelsoort[] = [];
    competities: KnbbCompetitie[] = [];
    competitie: KnbbCompetitie = new KnbbCompetitie();
    biljartPointLink: string = '';
    onzestandenLink: string = '';
    naamFilterInit: string = localStorage.getItem('spelersNaamFilter') || '';
    naamFilter: string = localStorage.getItem('spelersNaamFilter') || '';
    verenigingFilterInit: string = '';
    verenigingFilter: string = '';
    teamFilter: string = '';
    knbbTeamData: TeamPageData = new TeamPageData();
    moyenneMode: boolean = false;
    aantMoyVerschillen: number = 0;
    showKnbbMoys: boolean = false;
    moyenneEdit: number = 0;
    scrollElm!: HTMLDivElement;
    listScroll!: Scrolling;
    buttons: Button[] = [
        new Button('+', 'Speler toevoegen', true),
        new Button('M', 'Moyennes wijzigen', true)
    ];

    htmlSpelerLijst = viewChild<ElementRef<HTMLInputElement>>("spelerlijst");
    htmlVerFilter = viewChild<ElementRef<HTMLInputElement>>("verfilter");
    @ViewChild('moyenne', { static: false }) myInput!: ElementRef<HTMLInputElement>;

    constructor() {
        super();
        effect(() => {
            this.htmlVerFilter()?.nativeElement;
            this.htmlSpelerLijst()?.nativeElement;
        });
    }

    async getTeamFromKnbbSite() {
        const comp = this.competities.find(cmp => {
            return cmp.teams.some(tm => tm.verId == this.verenigingFilter && tm.teamId == this.teamFilter);
        });
        if (!comp) {
            return;
        }
        const orgId = comp.osOrg;
        const compId = comp.osComp;
        const team = this.vereniging.teams.find(tm => tm.teamId == this.teamFilter);
        const teamId = team ? team.knbbId : '';
        if (compId == '' || orgId == '' || compId == '') {
            return;
        }
        try {
            this.knbbTeamData = await this.bssApi.getTeamFromOnzestanden(teamId, orgId, compId);
            console.log(this.knbbTeamData);
        }
        catch (err) {
            console.log(err);
        }
    }

    enterPressed() {
        this.spelerClicked(this.spelerList.selectedIdx);
    }

    override escapePressed(): void {
        if (this.moyenneMode) {
            this.moyennesWijzigenClicked();
        }
        else if (this.naamFilter != this.naamFilterInit) {
            this.naamFilter = this.naamFilterInit;
            this.naamFilterChanged();
        }
        else {
            super.escapePressed();
        }
    }

    buttonPressed(idx: number) {
        if (idx == 0) {
            this.buttons[idx].selected = true;
            setTimeout(() => {
                this.buttons[idx].selected = false;
                this.spelerToevoegenClicked();
            }, 250);
        }
        else if (idx == 1) {
            this.moyennesWijzigenClicked();
        }
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.spelerToevoegenClicked();
        }
        else if (idx == 1) {
            this.moyennesWijzigenClicked();
        }
    }

    spelerClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.spelerList.selectItem(idx);
        if (this.moyenneMode) {
            this.moyenneEdit = this.spelerList.getSelectedItem()?.getGemiddeldeVanSpel() || 0;
            setTimeout(() => {
                this.myInput.nativeElement.select();
            }, 200);
            return;
        }
        this.appData.gotoPage(this.router.url, '/onderhoud/spelers/' + this.spelerList.getItem(idx)?.speler.id);
    }

    spelerToevoegenClicked() {
        let url = '/onderhoud/spelers/toevoegen';
        if (this.verenigingFilter.length) {
            url += '/' + this.verenigingFilter;
        }
        this.appData.gotoPage(this.router.url, url);
    }

    spelerVerwijderenClicked(event: any, speler: Speler) {
        event.stopPropagation();
        this.bssApi.deleteSpeler(speler)
        .then((resp: ApiResponse) => {
            this.alert.showAlert(resp.message, 'success');
            this.removeFromSpelerList(speler);
        })
        .catch(err => {
            this.alert.showAlert(err, 'error');
        })
    }

    async moyennesWijzigenClicked() {
        this.knbbTeamData = new TeamPageData();
        this.showKnbbMoys = false;
        if (!this.spelerList.filtered.length) {
            return;
        }
        this.moyenneMode = !this.moyenneMode;
        if (!this.moyenneMode) {
            this.buttons[1].selected = false;
            this.buttons[1].text = 'Moyennes wijzigen';
            this.spelerList.clearSelection();
            this.sortSpelers();
            this.teamFilter = '';
            this.teamFilterChanged();
            this.aantMoyVerschillen = 0;
        }
        else {
            if (this.onzestandenLink != '') {
                this.aantMoyVerschillen = 0;
                await this.getTeamFromKnbbSite();
                this.spelerList.filtered.forEach(spl => {
                    if (spl.speler.knbbId != '') {
                        const dat = this.knbbTeamData.spelers.find(item => item.splKnbbId == spl.speler.knbbId);
                        if (dat) {
                            spl.knbbMoy = dat.splMoyenne;
                            if (+spl.knbbMoy != spl.getGemiddeldeVanSpel()) {
                                this.aantMoyVerschillen++;
                            }
                            this.showKnbbMoys = true;
                        }
                    }
                });
            } 
            this.buttons[1].selected = true;
            this.buttons[1].text = 'Moyennes wijzigen stoppen';
            const idx = this.spelerList.selectedIdx < 0 ? 0 : this.spelerList.selectedIdx;
            this.spelerList.selectItem(idx);
            this.moyenneEdit = this.spelerList.getSelectedItem()?.getGemiddeldeVanSpel() || 0;
            setTimeout(() => {
                this.myInput.nativeElement.select();
            }, 200);
        }
        this.setEscapeCount();
    }

    wijzigSpelerMoyenne(spl: SpelerWrapper) {
        spl.speler.gemiddeldes[spl.idxMoyenne].gemiddelde = +spl.knbbMoy;
        this.bssApi.updateSpeler(spl.speler)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success')
            this.aantMoyVerschillen--;
        })
        .catch(err => {
            this.alert.showAlert(err, 'error');
        });
    }

    wijzigAllSpelerMoyennes() {
        let spelersToUpdate: Speler[] = [];
        this.spelerList.filtered.forEach(spl => {
            if (spl.knbbMoy != '' && spl.getGemiddeldeVanSpel() != +spl.knbbMoy) {
                spl.speler.gemiddeldes[spl.idxMoyenne].gemiddelde = +spl.knbbMoy;
                spelersToUpdate.push(spl.speler);
            }
        });
        if (spelersToUpdate.length > 0) {
            this.bssApi.updateSpelers(spelersToUpdate)
            .then(resp => {
                this.alert.showAlert(resp.message, 'success')
            })
            .catch(err => {
                this.alert.showAlert(err, 'error');
            });    
        }
    }

    keydownMoyenne(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
        if (event.key === 'm' || event.key === '+' || event.key === '=') {
            event.preventDefault();
        }
    }

    async keyupMoyenne(event: KeyboardEvent) {
        if (event.key == 'Enter') {
            event.stopPropagation();
            if (!this.moyenneEdit) {
                this.moyenneEdit = 0;
            }
            if (this.moyenneEdit > 0 && this.moyenneEdit != this.spelerList.getSelectedItem()?.getGemiddeldeVanSpel()) {
                let speler = this.spelerList.getSelectedItem()?.speler;
                if (speler) {
                    let foundGem = speler.gemiddeldes.find(gem => gem.spelId == this.spelId);
                    if (foundGem) {
                        foundGem.gemiddelde = this.moyenneEdit;
                        await this.bssApi.updateSpeler(speler)
                        .then(resp => {
                            this.alert.showAlert(resp.message, 'success')
                        })
                        .catch(err => {
                            this.alert.showAlert(err, 'error');
                        });
                    }
                }
            }
            this.spelerList.selectNextItem();
            this.listScroll.scrollDown(this.spelerList.selectedIdx);
            this.spelerClicked(this.spelerList.selectedIdx);
        }
    }

    naamFilterChanged(event?: KeyboardEvent) {
        if (event && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape')) {
            return;
        }
        localStorage.setItem('spelersNaamFilter', this.naamFilter);
        this.filtersChanged();
        this.sortSpelers();
        this.initListScrolling(this.scrollElm);
        this.setEscapeCount();
    }

    verenigingFilterChanged() {
        localStorage.setItem('spelersVerenigingFilter', this.verenigingFilter);
        this.teamFilter = '';
        this.biljartPointLink = '';
        this.onzestandenLink = '';
        if (this.verenigingFilter == '' || this.verenigingFilter == '0') {
            this.vereniging = new Vereniging();
        }
        else {
            this.vereniging = this.verenigingen.find(ver => ver.verId == this.verenigingFilter) || new Vereniging();
        }
        this.sortTeams();
        this.teamFilter = '';
        this.filtersChanged();
        this.sortSpelers();
        this.htmlVerFilter()?.nativeElement.blur();
    }

    teamFilterChanged() {
        this.biljartPointLink = this.teamFilter == '' ? '' : this.getBiljartpointLink();
        this.onzestandenLink = this.teamFilter == '' ? '' : this.getOnzestandenLink();
        this.filtersChanged();
        this.sortSpelers();
    }

    filtersChanged() {
        if (!this.naamFilter.length && !this.verenigingFilter.length) {
            this.spelerList.filter((item: SpelerWrapper) => { return true; });
            return;
        }
        if (this.naamFilter.length && this.verenigingFilter.length) {
            this.spelerList.filter((item: SpelerWrapper) => {
                const naamOk = item.getNaam().toLowerCase().indexOf(this.naamFilter.toLowerCase()) >= 0;
                let verenigingOk = false;
                if (this.verenigingFilter == '0') {
                    verenigingOk = !item.speler.verenigingIds.length;
                }
                else {
                    verenigingOk = item.speler.verenigingIds.some(id => id == this.verenigingFilter);
                }
                return naamOk && verenigingOk;
            });
            this.applyTeamFilter();
            return;
        }
        if (this.naamFilter.length) {
            this.spelerList.filter((item: SpelerWrapper) => {
                return item.getNaam().toLowerCase().indexOf(this.naamFilter.toLowerCase()) >= 0;
            });
        }
        else {
            this.spelerList.filter((item: SpelerWrapper) => {
                let verenigingOk = false;
                if (this.verenigingFilter == '0') {
                    verenigingOk = !item.speler.verenigingIds.length;
                }
                else {
                    verenigingOk = item.speler.verenigingIds.some(id => id == this.verenigingFilter);
                }
                return verenigingOk;
            });
        }
        this.applyTeamFilter();
    }

    private applyTeamFilter() {
        if (this.teamFilter == '' || this.vereniging.teams.length == 0) {
            return;
        }
        const team = this.vereniging.teams.find(tm => tm.teamId == this.teamFilter);
        if (team) {
            this.spelerList.filtered = this.spelerList.filtered.filter(spl => {
                return team.teamLeden.some(lidId => lidId == spl.speler.id);
            }); 
        }
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent): boolean {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
        return true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        const fromInput = event.target instanceof HTMLInputElement;
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.spelerList.selectPreviousItem();
                this.listScroll.scrollUp(this.spelerList.selectedIdx);
            }
            if (event.key === 'ArrowDown') {
                this.spelerList.selectNextItem();
                this.listScroll.scrollDown(this.spelerList.selectedIdx);
            }
            if (this.moyenneMode) {
                this.spelerClicked(this.spelerList.selectedIdx);
            }
            return false;
        }
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'Equal' || event.code === 'NumpadAdd' || event.code == 'Insert') {
            if (!this.moyenneMode) {
                this.buttonPressed(0);
                return false;
            }
            return true;
        }
        if (event.code === 'KeyM') {
            if (fromInput && (<HTMLInputElement> event.target).id == 'naamfilter') {
                return true;
            }
            if (this.spelerList.filtered.length == 0) {
                return true;
            }
            this.buttonPressed(1);
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }    
        return true;
    }

    ngOnInit(): void {
        const config = this.appData.getConfig();
        if (!config) {
            return;
        }
        if (this.appData.getDistrict().disId == '') {
            this.alert.showAlert('Er is nog geen voorkeur district ingesteld.', 'warning', 6);
            this.router.navigate(['home']);
            return;
        }
        this.verenigingFilter = this.verenigingFilterInit = localStorage.getItem('spelersVerenigingFilter') || config.vereniging;
        this.fromVereniging = this.router.url.startsWith('/onderhoud/verenigingen');
        if (this.fromVereniging) {
            const id: string | null = this.route.snapshot.paramMap.get('verId');
            if (id) {
                this.verenigingFilter = this.verenigingFilterInit = id;
            }
        }
        Promise.all([
            this.bssApi.getVerenigingen(),
            this.bssApi.getSpelersLijst(this.spelId),
            this.bssApi.getSpelsoorten(),
            this.bssApi.getKnbbCompetities(this.appData.getDistrict().disId, this.spelId)
        ])
        .then(results => {
            this.competities = results[3];
            this.verenigingen = results[0];
            this.verenigingen.sort(this.compareVerenigingen);
            if (this.fromVereniging) {
                const vereniging = this.verenigingen.find(v => v.verId == this.verenigingFilter);
                if (vereniging) {
                    this.subtitle = `Spelers van vereniging '${vereniging.naam}'`;
                }
            }
            this.spelerList.fillItems(results[1]);
            this.spelsoorten = results[2];
            if (this.verenigingFilter != '') {
                this.verenigingFilterChanged();
            }
            this.sortSpelers();
            const elm = this.htmlSpelerLijst()?.nativeElement;
            if (elm) {
                this.scrollElm = elm;
                new ResizeObserver(() => { 
                    this.initListScrolling(this.scrollElm);
                }).observe(this.scrollElm);
            }    
        })
        .catch((err) => {
            this.alert.showAlert(err, 'error');
        });
    }

    private initListScrolling(elm: HTMLDivElement) {
        if (elm) {
            if (this.spelerList.selectedIdx >= 0) {
                this.spelerList.selectedIdx = 0;
            }
            this.listScroll = new Scrolling(elm, elm.offsetHeight, this.spelerList.filtered.length);
            console.log('resize event - pos = ' + this.listScroll.scrollPos);    
        }
    }

    private removeFromSpelerList(speler: Speler): void {
        const idx = this.spelerList.items.findIndex(item => item.speler.id == speler.id);
        if (idx >= 0) {
            this.spelerList.items.splice(idx, 1);
            this.filtersChanged();
            this.sortSpelers();
            this.initListScrolling(this.scrollElm);
        }
    }

    compareVerenigingen(a: Vereniging, b: Vereniging): number {
        if (a.naam == b.naam) {
            return 0;
        }
        return (a.naam > b.naam) ? 1 : -1;
    }

    private setEscapeCount() {
        this.escapeCount = 0;
        if (this.moyenneMode) {
            this.escapeCount++;
        }
        if (this.naamFilter != this.naamFilterInit) {
            this.escapeCount++;
        }
    }

    private getBiljartpointLink(): string {
        const comp = this.competities.find(cmp => {
            return cmp.teams.some(tm => tm.verId == this.verenigingFilter && tm.teamId == this.teamFilter);
        });
        if (!comp) {
            return '';
        }
        const compId = comp.knbbId;
        const team = this.vereniging.teams.find(tm => tm.teamId == this.teamFilter);
        const teamId = team ? team.knbbId : '';
        const poule = comp.poule == 0 ? '' : '' + comp.poule;
        const distrId = this.appData.getDistrict().knbbId;
        if (compId == '' || teamId == '' || poule == '' || distrId == '') {
            return '';
        }
        return `https://biljartpoint.nl/index.php?page=teamdetail&team_id=${teamId}&compid=${compId}&poule=${poule}&district=${distrId}`;
    }

    private getOnzestandenLink(): string {
        const comp = this.competities.find(cmp => {
            return cmp.teams.some(tm => tm.verId == this.verenigingFilter && tm.teamId == this.teamFilter);
        });
        if (!comp) {
            return '';
        }
        const org = comp.osOrg;
        const cmp = comp.osComp;
        const team = this.vereniging.teams.find(tm => tm.teamId == this.teamFilter);
        const teamId = team ? team.knbbId : '';
        if (teamId == '' || org == '' || cmp == '') {
            return '';
        }
        return `https://kempenland.onzestanden.nl/team.php?team=${teamId}&organisatie=${org}&competitie=${cmp}`;
    }

    sortSpelers() {
        this.spelerList.filtered.sort((a, b) => {
            if (a.getGemiddeldeVanSpel() == b.getGemiddeldeVanSpel()) {
                if (a.getNaam() == b.getNaam()) {
                    return 0;
                }
                return (a.getNaam() > b.getNaam()) ? 1 : -1;
            }
            else {
                return b.getGemiddeldeVanSpel() - a.getGemiddeldeVanSpel();
            }
        });
    }

    sortTeams() {
        this.vereniging.teams.sort((a: Team, b: Team) => {
            return a.teamId < b.teamId ? -1 : 1;
        });
    }

    spelerZitInTeam(speler: Speler): boolean {
        return speler.verenigingIds.some(verId => {
            const foundVer = this.verenigingen.find(ver => ver.verId == verId);
            if (foundVer) {
                return foundVer.teams.some(team => {
                    return team.teamLeden.some(lid => lid == speler.id);
                });
            }
            return false;
        });
    }

    getKorteVerenigingNaam(id: string): string {
        const found = this.verenigingen.find(ver => ver.verId == id);
        return found ? found.korteNaam : '';
    }
}
