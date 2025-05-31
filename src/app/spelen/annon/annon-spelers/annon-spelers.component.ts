import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { NgClass } from '@angular/common';
import { HelperService } from '../../../services/helper.service';
import { List } from '../../../model/list';
import { VerenigingKort } from '../../../model/vereniging';
import { SpelerWrapper } from '../../../model/speler';
import { Annonceer, AnnonSpeler, AnnonSpelerStand } from '../../../model/annonceer';
import { Button } from '../../../model/button';
import { Scrolling } from '../../../model/scrolling';

@Component({
    selector: 'app-annon-spelers',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass
    ],
    templateUrl: './annon-spelers.component.html',
    styleUrl: './annon-spelers.component.css'
})
export class AnnonSpelersComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    subtitle: string = 'Pentathlon';
    activeSection: number = 0;
    verenigingLijst: List<VerenigingKort> = new List<VerenigingKort>();
    spelerLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    verenigingFilter: string = this.appData.getConfig()?.vereniging || '';
    wedOrig: Annonceer = new Annonceer();
    wedstrijd: Annonceer = new Annonceer();

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
        '4 spelers'
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
        this.router.navigate(['annon/aantspl']);
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
            this.wedstrijd.wedGespeeld = false;
            this.wedstrijd.spelers.forEach(spl => {
                spl.actief = false;
                spl.stand = new AnnonSpelerStand(this.wedstrijd.config.cats.length);
            });
        }
        this.bssApi.saveAnnonWedstrijd(this.wedstrijd)
        .then(resp => {
            this.router.navigate(['annon']);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    maakSpelerActief(idxSpl: number) {
        this.idxActiveSpeler = idxSpl;
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
            this.bssApi.getAnnonWedstrijd()
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
                this.wedOrig = results[2].annon;
                if (this.wedOrig.config.isAnnonceer) {
                    this.subtitle = 'Annonceren';
                }  
                this.subtitle += ' - ' + this.aantalTekst[this.wedOrig.config.aantSpelers];
            }
            if (this.wedOrig.config.aantSpelers == 0) {
                this.router.navigate(['annon/aantspl']);
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
        let speler: AnnonSpeler = this.getWedstrijdSpeler(this.idxActiveSpeler);
        if (speler && speler.splId == spelerToAdd.speler.id) {
            this.maakVolgendeSpelerActief();
            return;
        }
        speler.splId = spelerToAdd.speler.id;
        speler.splNaam = spelerToAdd.getNaam();
        speler.splBordNaam = spelerToAdd.speler.bordnaam && spelerToAdd.speler.bordnaam.length ? spelerToAdd.speler.bordnaam : spelerToAdd.speler.vnaam;
        speler.splSpreekNaam = (spelerToAdd.speler.spreeknaam != '') ? spelerToAdd.speler.spreeknaam : speler.splBordNaam;
        speler.splTsMoy = spelerToAdd.getGemiddeldeVanSpel();
        speler.splTsCar = this.wedstrijd.config.vastAantCars;
        if (this.wedstrijd.config.carsObvMoyenne) {
            let cars = Math.round(10 * speler.splTsMoy);
            if (cars < 3) { cars = 3; }
            if (cars > 10) { cars = 10; }
            speler.splTsCar = cars;
        }
        speler.splTsCarArr = this.getAantalBallenArr(speler.splTsCar);
        speler.grid.isAnnon = this.wedstrijd.config.isAnnonceer;
        if (this.wedstrijd.config.aantSpelers == 2 || this.wedstrijd.config.aantSpelers == 3) {
            // portrait view
            speler.grid.balWidth = 3;
            speler.grid.balContainerWidth = 3.125;
            if (speler.splTsCar > 5) {
                speler.grid.balContainerWidth = 18.5 / speler.splTsCar;
                speler.grid.balWidth = speler.grid.balContainerWidth - .125;
            }
        }
        else {
            // landscape view
            if (speler.grid.isAnnon) {
                speler.grid.balWidth = 5;
                speler.grid.balContainerWidth = 5.7;
                if (speler.splTsCar > 5) {
                    speler.grid.balContainerWidth = 28.5 / speler.splTsCar;
                    speler.grid.balWidth = speler.grid.balContainerWidth - .25;
                }
            }
            else {
                speler.grid.balWidth = 4.25;
                speler.grid.balContainerWidth = 4.75;
                if (speler.splTsCar > 6) {
                    speler.grid.balContainerWidth = 28.5 / speler.splTsCar;
                    speler.grid.balWidth = speler.grid.balContainerWidth - .25;
                }
            }
        }
        console.log(speler.grid);
        speler.stand = new AnnonSpelerStand(this.wedstrijd.config.cats.length);
        this.setWedstrijdChanged();
        this.maakVolgendeSpelerActief();
        this.setSpelersFilled();
    }

    private getAantalBallenArr(aantal: number): number[] {
        let result: number[] = [];
        for (let i = 0; i < aantal; i++) {
            result.push(i + 1);
        }
        return result;
    }

    private getWedstrijdSpeler(idxSpl: number): AnnonSpeler {
        return this.wedstrijd.spelers[idxSpl];
    }

    private maakVorigeSpelerActief() {
        if (this.wedstrijd.config.aantSpelers == 0) {
            return;
        }
        let idxSpl = this.idxActiveSpeler;
        idxSpl--;
        if (idxSpl < 0) {
            idxSpl = this.wedstrijd.config.aantSpelers - 1;
        }
        this.maakSpelerActief(idxSpl);
    }

    private maakVolgendeSpelerActief() {
        if (this.wedstrijd.config.aantSpelers == 0) {
            return;
        }
        let idxSpl = this.idxActiveSpeler;
        idxSpl++;
        if (idxSpl >= this.wedstrijd.config.aantSpelers) {
            idxSpl = 0;
        }
        this.maakSpelerActief(idxSpl);
    }

    private setSpelersFilled() {
        this.spelersFilled = false;
        if (this.wedstrijd.config.aantSpelers == 0) {
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
        if (this.wedstrijd.config.aantSpelers != this.wedOrig.config.aantSpelers) {
            this.wedstrijdChanged = true;
            return;
        }
        this.wedstrijdChanged = this.wedstrijd.spelers.some((spl, idx) => {
            return spl.splId != this.wedOrig.spelers[idx].splId;
        });
    }

    private copyWedstrijd(): Annonceer {
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
