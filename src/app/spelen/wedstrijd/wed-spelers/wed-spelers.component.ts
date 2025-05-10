import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { WedSpeler, WedSpelerStand, Wedstrijd, WedTeam } from '../../../model/wedstrijd';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { List } from '../../../model/list';
import { NgClass } from '@angular/common';
import { Button } from '../../../model/button';
import { SpelerWrapper } from '../../../model/speler';
import { VerenigingKort } from '../../../model/vereniging';
import { HelperService } from '../../../services/helper.service';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { Scrolling } from '../../../model/scrolling';

@Component({
    selector: 'app-wed-spelers',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass
    ],
    templateUrl: './wed-spelers.component.html',
    styleUrl: './wed-spelers.component.css'
})
export class WedSpelersComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    subtitle: string = 'Oefen wedstrijd';
    activeSection: number = 0;
    verenigingLijst: List<VerenigingKort> = new List<VerenigingKort>();
    spelerLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    verenigingFilter: string = this.appData.getConfig()?.vereniging || '';
    wedOrig: Wedstrijd = new Wedstrijd();
    wedstrijd: Wedstrijd = new Wedstrijd();

    idxActiveTeam: number = -1;
    idxActiveSpeler: number = -1;

    spelersFilled: boolean = false;
    wedstrijdChanged: boolean = false;

    pageButtons: Button[] = [new Button('Enter', 'Ga verder', true)];
    sectionButtons: Button[] = [new Button('Enter', 'Selecteer', true)];

    aantalTekst: string[] = [
        'dummy',
        '1 speler',
        '2 spelers',
        '3 spelers',
        '4 spelers',
        '4 (2 x 2) spelers'
    ];

    scrollElmVer!: HTMLDivElement;
    verScrolling!: Scrolling;
    scrollElmSpl!: HTMLDivElement;
    splScrolling!: Scrolling;

    htmlVerLijst = viewChild<ElementRef<HTMLDivElement>>('vereniginglijst');
    htmlSplLijst = viewChild<ElementRef<HTMLDivElement>>('spelerlijst');

    constructor() {
        super();
        effect(() => {
            this.htmlVerLijst()?.nativeElement;
            this.htmlSplLijst()?.nativeElement;
        });
    }

    override escapePressed(): void {
        if (this.verenigingLijst.hoveredIdx != this.verenigingLijst.selectedIdx || this.spelerLijst.hoveredIdx >= 0) {
            this.verenigingLijst.hoveredIdx = this.verenigingLijst.selectedIdx;
            this.spelerLijst.hoveredIdx = -1;
            this.setEscapeCount();
            return;
        }
        if (this.wedstrijdChanged) {
            this.resetClicked();
            return;
        }
        this.previousClicked();
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                if (this.verenigingLijst.hoveredIdx == this.verenigingLijst.selectedIdx && this.spelerLijst.hoveredIdx < 0) {
                    if (this.spelersFilled) {
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
        this.router.navigate(['wedstrijd/aantspl']);
    }

    pageButtonClicked() {
        this.gaVerderClicked();
    }

    enterSelectClicked() {
        if (this.activeSection == 0) {
            this.verenigingClicked(this.verenigingLijst.hoveredIdx);
        }
        else if (this.activeSection == 1) {
            this.spelerClicked(this.spelerLijst.hoveredIdx);
        }
    }

    verenigingClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.activeSection = 0;
        this.verenigingLijst.selectedIdx = idx;
        this.verenigingLijst.hoveredIdx = idx;
        const vereniging: VerenigingKort = this.verenigingLijst.filtered[idx];
        this.verenigingFilter = vereniging.verId;
        this.spelerLijst.clearSelection();
        this.filterSpelerLijst();
        if (this.spelerLijst.filtered.length > 0) {
            this.activeSection++;
        }
        this.setEscapeCount();
    }

    spelerClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.activeSection = 1;
        this.spelerLijst.hoveredIdx = -1;
        this.addSpelerToWedstrijd(this.spelerLijst.filtered[idx]);
        this.setEscapeCount();
    }

    resetClicked() {
        this.verenigingFilter = this.appData.getConfig()?.vereniging || '';
        this.verenigingLijst.selectedIdx = this.verenigingLijst.filtered.findIndex(v => v.verId == this.verenigingFilter);
        this.verenigingLijst.hoveredIdx = this.verenigingLijst.selectedIdx;
        this.activeSection = this.verenigingLijst.selectedIdx < 0 ? 0 : 1;
        this.filterSpelerLijst();
        this.spelerLijst.selectedIdx = this.spelerLijst.hoveredIdx = -1;
        this.wedstrijd = this.copyWedstrijd();
        if (this.wedstrijd.teams.length > 0) {
            this.idxActiveTeam = 0;
        }
        this.idxActiveSpeler = 0;
        this.setSpelersFilled();
        this.wedstrijdChanged = false;
        this.setEscapeCount();
    }

    gaVerderClicked() {
        if (!this.spelersFilled) {
            return;
        }
        console.log(this.wedstrijd);
        if (this.wedstrijdChanged) {
            this.wedstrijd.wedOver = false;
            this.wedstrijd.isVastAantBrt = true;
            this.wedstrijd.isVastAantCar = true;
            this.wedstrijd.maxBeurten = 0;
            this.wedstrijd.tsBeurten = 0;
            this.wedstrijd.tsCaramboles = 0;
            this.helper.clearWedstrijdResultaten(this.wedstrijd);
        }
        this.bssApi.saveWedstrijd(this.wedstrijd)
        .then(resp => {
            const gotoUrl = this.router.url.replace('spelers', 'config');
            this.router.navigate([gotoUrl]);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    maakSpelerActief(idxSpl: number, idxTeam?: number) {
        this.idxActiveSpeler = idxSpl;
        if (idxTeam != undefined) {
            this.idxActiveTeam = idxTeam;
        }
    }

    maakSectionActief(idx: number) {
        this.activeSection = idx;
        this.spelerLijst.hoveredIdx = -1;
        this.verenigingLijst.hoveredIdx = this.verenigingLijst.selectedIdx;
        this.setEscapeCount();
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
        //console.log(event);
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
                    this.verenigingLijst.hoverPreviousItem();
                    this.verScrolling.scrollUp(this.verenigingLijst.hoveredIdx);
                    this.setEscapeCount();
                }
                else if (this.activeSection == 1) {
                    this.spelerLijst.hoverPreviousItem();
                    this.splScrolling.scrollUp(this.spelerLijst.hoveredIdx);
                    this.setEscapeCount();
                }
                return false;
            }
            if (event.key === 'ArrowDown') {
                if (this.activeSection == 2 || event.ctrlKey) {
                    this.maakVolgendeSpelerActief();
                }
                else if (this.activeSection == 0) {
                    this.verenigingLijst.hoverNextItem();
                    this.verScrolling.scrollDown(this.verenigingLijst.hoveredIdx);
                    this.setEscapeCount();
                }
                else if (this.activeSection == 1) {
                    this.spelerLijst.hoverNextItem();
                    this.splScrolling.scrollDown(this.spelerLijst.hoveredIdx);
                    this.setEscapeCount();
                }
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (this.verenigingLijst.hoveredIdx == this.verenigingLijst.selectedIdx && this.spelerLijst.hoveredIdx < 0 && this.spelersFilled) {
                this.buttonPressed(this.pageButtons[0]);
                this.setEscapeCount();
                return false;
            }
            if (this.verenigingLijst.hoveredIdx != this.verenigingLijst.selectedIdx || this.spelerLijst.hoveredIdx >= 0) {
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
        Promise.all([
            this.bssApi.getVerenigingenKort(),
            this.bssApi.getSpelersLijst(this.spelId),
            this.bssApi.getWedstrijd()
        ])
        .then(results => {
            let verenigingen = results[0];
            verenigingen.sort(this.compareVerenigingen);
            verenigingen.unshift({
                verId: '',
                naam: 'Geen',
                korteNaam: 'Geen',
                inTeam: false
            });
            this.verenigingLijst.fillItems(verenigingen);
            this.verenigingLijst.selectedIdx = this.verenigingLijst.filtered.findIndex(v => v.verId == this.verenigingFilter);
            this.verenigingLijst.hoveredIdx = this.verenigingLijst.selectedIdx;
            this.spelerLijst.fillItems(results[1]);
            this.filterSpelerLijst();
            if (results[2].gevonden) {
                this.wedOrig = results[2].wedstrijd;
                this.subtitle += ' - ' + this.aantalTekst[this.wedOrig.aantSpelers];
            }
            if (this.wedOrig.aantSpelers == 0) {
                this.router.navigate(['wedstrijd/aantspl']);
                return;
            } 
            this.resetClicked();
            this.setupScrolling();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private setupScrolling() {
        setTimeout(() => {
            const elmV = this.htmlVerLijst()?.nativeElement;
            if (elmV) {
                this.scrollElmVer = elmV;
                new ResizeObserver(() => { 
                    this.initLijstScrolling(this.scrollElmVer, 'ver');
                }).observe(this.scrollElmVer);
            }
            const elmS = this.htmlSplLijst()?.nativeElement;
            if (elmS) {
                this.scrollElmSpl = elmS;
                new ResizeObserver(() => { 
                    this.initLijstScrolling(this.scrollElmSpl, 'spl');
                }).observe(this.scrollElmSpl);
            }
        }, 500);
    }

    private initLijstScrolling(elm: HTMLDivElement, lijst: string) {
        if (elm) {
            if (lijst == 'ver') {
                this.verScrolling = new Scrolling(elm, elm.offsetHeight, this.verenigingLijst.filtered.length, this.verenigingLijst.hoveredIdx);
                console.log('resize event - pos = ' + this.verScrolling.scrollPos);
            }
            else {
                this.splScrolling = new Scrolling(elm, elm.offsetHeight, this.spelerLijst.filtered.length, this.spelerLijst.hoveredIdx);
                console.log('resize event - pos = ' + this.splScrolling.scrollPos);
            }
        }
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

    private addSpelerToWedstrijd(spelerToAdd: SpelerWrapper) {
        let speler: WedSpeler = this.getWedstrijdSpeler(this.idxActiveSpeler, this.idxActiveTeam);
        if (speler && speler.splId == spelerToAdd.speler.id) {
            this.maakVolgendeSpelerActief();
            return;
        }
        speler.splId = spelerToAdd.speler.id;
        speler.splNaam = spelerToAdd.getNaam();
        speler.splBordNaam = spelerToAdd.speler.bordnaam && spelerToAdd.speler.bordnaam.length ? spelerToAdd.speler.bordnaam : spelerToAdd.speler.vnaam;
        speler.splSpreekNaam = (spelerToAdd.speler.spreeknaam != '') ? spelerToAdd.speler.spreeknaam : speler.splBordNaam;
        speler.splTsGem = spelerToAdd.getGemiddeldeVanSpel();
        speler.stand = new WedSpelerStand();
        this.setWedstrijdChanged();
        this.maakVolgendeSpelerActief();
        this.setSpelersFilled();
    }

    private getWedstrijdSpeler(idxSpl: number, idxTeam: number): WedSpeler {
        if (idxTeam >= 0) {
            return this.wedstrijd.teams[idxTeam].spelers[idxSpl];
        }
        return this.wedstrijd.spelers[idxSpl];
    }

    private maakVorigeSpelerActief() {
        if (this.wedstrijd.aantSpelers == 0) {
            return;
        }
        let idxSpl = this.idxActiveSpeler;
        let idxTeam = this.idxActiveTeam;
        if (this.wedstrijd.aantSpelers == 5) {
            if (idxSpl == 1) {
                idxSpl--;
            }
            else {
                if (idxTeam == 1) {
                    idxTeam--;
                    idxSpl = 1;
                }
                else {
                    idxTeam = 1;
                    idxSpl = 1;
                }
            }
            this.maakSpelerActief(idxSpl, idxTeam);
        }
        else {
            idxSpl--;
            if (idxSpl < 0) {
                idxSpl = this.wedstrijd.aantSpelers - 1;
            }
            this.maakSpelerActief(idxSpl);
        }
    }

    private maakVolgendeSpelerActief() {
        if (this.wedstrijd.aantSpelers == 0) {
            return;
        }
        let idxSpl = this.idxActiveSpeler;
        let idxTeam = this.idxActiveTeam;
        if (this.wedstrijd.aantSpelers == 5) {
            if (idxSpl == 0) {
                idxSpl++;
            }
            else {
                if (idxTeam == 0) {
                    idxTeam++;
                    idxSpl = 0;
                }
                else {
                    console.log('jaja')
                    idxTeam = 0;
                    idxSpl = 0;
                }
            }
            this.maakSpelerActief(idxSpl, idxTeam);
        }
        else {
            idxSpl++;
            if (idxSpl >= this.wedstrijd.aantSpelers) {
                idxSpl = 0;
            }
            this.maakSpelerActief(idxSpl);
        }
    }

    private setSpelersFilled() {
        this.spelersFilled = false;
        if (this.wedstrijd.aantSpelers == 0) {
            return;
        }
        if (this.wedstrijd.aantSpelers == 5) {
            this.spelersFilled = this.wedstrijd.teams.every(team => {
                return team.spelers.every(spl => spl.splId != '');
            });
            return;
        }
        this.spelersFilled = this.wedstrijd.spelers.every(spl => spl.splId != '');
    }

    private filterSpelerLijst() {
        if (this.verenigingLijst.selectedIdx < 0) {
            this.spelerLijst.filter(sp => false);
            return;
        }
        if (this.verenigingFilter == '') {
            this.spelerLijst.filter(sp => sp.speler.verenigingIds.length == 0);
            return;
        }
        this.spelerLijst.filter(sp => {
            return sp.isLidVan(this.verenigingFilter);
        })
        this.spelerLijst.filtered.sort(this.compareSpelers);
    }

    private setWedstrijdChanged() {
        this.wedstrijdChanged = false;
        if (this.wedstrijd.aantSpelers != this.wedOrig.aantSpelers) {
            this.wedstrijdChanged = true;
            return;
        }
        if (this.wedstrijd.aantSpelers == 5) {
            this.wedstrijdChanged = this.wedstrijd.teams.some((team, idxT) => {
                return team.spelers.some((spl, idxS) => {
                    return spl.splId != this.wedOrig.teams[idxT].spelers[idxS].splId;
                });
            });
        }
        else {
            this.wedstrijdChanged = this.wedstrijd.spelers.some((spl, idx) => {
                return spl.splId != this.wedOrig.spelers[idx].splId;
            });
        }
    }

    private copyWedstrijd(): Wedstrijd {
        return JSON.parse(JSON.stringify(this.wedOrig));
    }

    private compareSpelers(a: SpelerWrapper, b: SpelerWrapper): number {
        if (a.getGemiddeldeVanSpel() == b.getGemiddeldeVanSpel()) {
            return (a.getNaam() > b.getNaam()) ? 1 : -1;
        }
        else {
            return b.getGemiddeldeVanSpel() - a.getGemiddeldeVanSpel(); 
        }
    }

    private compareVerenigingen(a: VerenigingKort, b: VerenigingKort): number {
        return (a.naam > b.naam) ? 1 : -1;
    }

    private setEscapeCount() {
        this.escapeCount = this.wedstrijdChanged ? 1 : 0;
        if (this.verenigingLijst.hoveredIdx != this.verenigingLijst.selectedIdx || this.spelerLijst.hoveredIdx >= 0) {
            this.escapeCount++;
        }
    }

}
