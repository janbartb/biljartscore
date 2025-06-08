import { Component, effect, ElementRef, HostListener, inject, OnInit, signal, viewChild } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { CmpSplWedstrijd, Competitie } from '../../../../model/competitie';
import { NgClass } from '@angular/common';
import { Button } from '../../../../model/button';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';
import { List } from '../../../../model/list';
import { Scrolling } from '../../../../model/scrolling';
import { FormsModule } from '@angular/forms';

class Wed {
    datum: string = '';
    wedDatum: string = '';
    ronde: number = 0;
    splWed: WedSpl = new WedSpl();
    tegWed: WedSpl = new WedSpl();
}

class WedSpl {
    splId: string = '';
    splIdx: number = -1;
    splNaam: string = '';
    uitslag: CmpSplWedstrijd = new CmpSplWedstrijd();
}

@Component({
    selector: 'app-eigen-competitie-weds',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './eigen-competitie-weds.component.html',
    styleUrl: './eigen-competitie-weds.component.css'
})
export class EigenCompetitieWedsComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    title: string = '';
    compNaam: string = '';
    wedLijst: List<Wed> = new List<Wed>();

    datFilter: string = '';
    rndFilter: string = '';
    splFilter: string = '';
    datOpts: string[] = [];
    rndOpts: string[] = [];
    splOpts: string[] = [];

    wedButtons: Button[] = [
        new Button("Enter", 'Naar wedstrijd', true)
    ];

    scrollElm!: HTMLDivElement;
    listScroll!: Scrolling;
    htmlWedLijst = viewChild<ElementRef<HTMLInputElement>>("wedlijst");

    constructor() {
        super();
        effect(() => {
           this.htmlWedLijst()?.nativeElement;
        });
    }

    override escapePressed(): void {
        if (this.wedLijst.hoveredIdx >= 0) {
            this.wedLijst.hoveredIdx = -1;
            this.setEscapeCount();
            return;
        }
        if (!this.filtersAreEmpty()) {
            this.datFilter = '';
            this.rndFilter = '';
            this.splFilter = '';
            this.filtersChanged();
            return;
        }
        super.escapePressed();
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            this.buttonClicked(0);
        }, 300);
    }

    buttonClicked(idx: number) {
        if (this.wedLijst.hoveredIdx >= 0) {
            this.wedstrijdClicked(this.wedLijst.hoveredIdx);
        }
    }

    wedstrijdClicked(idx: number) {
        const wed = this.wedLijst.filtered[idx];
        const url = `eigencomps/${this.compNaam}/match/${wed.ronde - 1}/${wed.splWed.splIdx}/${wed.tegWed.splIdx}`;
        console.log(url);
        this.appData.gotoPage(this.router.url, url);
    }

    filtersChanged() {
        if (this.filtersAreEmpty()) {
            this.wedLijst.filtered = this.wedLijst.items.filter(() => true);
        }
        else {
            this.wedLijst.filtered = this.wedLijst.items.filter((item) => {
                const datOk = this.datFilter == '' || item.datum == this.datFilter;
                const rndOk = this.rndFilter == '' || ('' + item.ronde) == this.rndFilter;
                const splOk = this.splFilter == '' || item.splWed.splNaam == this.splFilter || item.tegWed.splNaam == this.splFilter;
                return datOk && rndOk && splOk;
            });
        }
        this.fillVisibleDatesAndDateOptions();
        this.setEscapeCount();
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
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.wedLijst.hoverPreviousItem();
                this.listScroll.scrollUp(this.wedLijst.hoveredIdx);
            }
            if (event.key === 'ArrowDown') {
                this.wedLijst.hoverNextItem();
                this.listScroll.scrollDown(this.wedLijst.hoveredIdx);
            }
            this.setEscapeCount();
            return false;
        }
        if (event.key === 'Enter') {
            if (this.wedLijst.hoveredIdx >= 0) {
                this.buttonPressed(this.wedButtons[0]);
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
        const naam: string | null = this.route.snapshot.paramMap.get('naam');
        if (!naam) {
            this.alert.showAlert('De competitienaam in de URL is niet geldig.', 'error');
            return;
        }
        let comp = new Competitie('');
        this.bssApi.getCompetitie(naam)
        .then(data => {
            if (data.gevonden) {
                comp = data.comp;
            }
            else {
                this.alert.showError(`Competitiebestand '${naam}.json' niet gevonden.`);
                return;
            }
            this.compNaam = comp.cmpNaam;
            this.title = `Competitie '${comp.cmpNaam}'`;
            let weds = this.getWedstrijdenAndFillFilterOptions(comp);
            weds.sort(this.compareWed);
            let oldDatum = '';
            weds.forEach(wed => {
                if (wed.datum != oldDatum) {
                    wed.wedDatum = wed.datum;
                    this.datOpts.push(wed.datum);
                }
                oldDatum = wed.datum;
            });
            this.datOpts.sort();
            this.datOpts.reverse();
            this.wedLijst.fillItems(weds);
            for (let i = 0; i < comp.cmpAantRondes; i++) {
                this.rndOpts.push('' + (i + 1));
            }
            const elm = this.htmlWedLijst()?.nativeElement;
            if (elm) {
                this.scrollElm = elm;
                new ResizeObserver(() => { 
                    this.initListScrolling(this.scrollElm);
                }).observe(this.scrollElm);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private initListScrolling(elm: HTMLDivElement) {
        if (elm) {
            if (this.wedLijst.hoveredIdx >= 0) {
                this.wedLijst.hoveredIdx = 0;
            }
            this.listScroll = new Scrolling(elm, elm.offsetHeight, this.wedLijst.filtered.length);
            console.log('resize event - pos = ' + this.listScroll.scrollPos);    
        }
    }

    private getWedstrijdenAndFillFilterOptions(comp: Competitie): Wed[] {
        let result: Wed[] = [];
        comp.cmpSpelers.forEach((spl, idxS) => {
            this.splOpts.push(spl.splBordnaam);
            spl.splRondes.forEach((splRnd, idxR) => {
                splRnd.wedstrijden.forEach((splWed, idxW) => {
                    let entry = new Wed();
                    entry.ronde = idxR + 1;
                    let idxT = comp.cmpSpelers.findIndex(sp => sp.splId == splWed.tegId);
                    if (idxT >= 0) {
                        let teg = comp.cmpSpelers[idxT];
                        let idx = teg.splRondes[idxR].wedstrijden.findIndex(tgWed => tgWed.tegId == spl.splId);
                        if (idx >= 0) {
                            let tegWed = teg.splRondes[idxR].wedstrijden[idx];
                            entry.datum = tegWed.datum;
                            if (splWed.metWit) {
                                entry.splWed.splId = spl.splId;
                                entry.splWed.splIdx = idxS;
                                entry.splWed.splNaam = spl.splBordnaam;
                                entry.splWed.uitslag = splWed;
                                entry.tegWed.splId = teg.splId;
                                entry.tegWed.splIdx = idxT;
                                entry.tegWed.splNaam = teg.splBordnaam;
                                entry.tegWed.uitslag = tegWed;
                            }
                            else {
                                entry.tegWed.splId = spl.splId;
                                entry.tegWed.splIdx = idxS;
                                entry.tegWed.splNaam = spl.splBordnaam;
                                entry.tegWed.uitslag = splWed;
                                entry.splWed.splId = teg.splId;
                                entry.splWed.splIdx = idxT;
                                entry.splWed.splNaam = teg.splBordnaam;
                                entry.splWed.uitslag = tegWed;
                            }
                            result.push(entry);
                            teg.splRondes[idxR].wedstrijden.splice(idx, 1);
                        }
                    }
                });
            });
        });
        this.splOpts.sort();
        return result;
    }

    private fillVisibleDatesAndDateOptions() {
        this.datOpts = [];
        let oldDatum = '';
        this.wedLijst.filtered.forEach(wed => {
            if (wed.datum != oldDatum) {
                wed.wedDatum = wed.datum;
                this.datOpts.push(wed.datum);
            }
            else {
                wed.wedDatum = '';
            }
            oldDatum = wed.datum;
        });
        this.datOpts.sort();
        this.datOpts.reverse();
    }

    private filtersAreEmpty(): boolean {
        return (this.datFilter + this.rndFilter + this.splFilter) == '';
    }

    private compareWed(a: Wed, b: Wed): number {
        if (a.datum == b.datum) {
            return a.splWed.splNaam > b.splWed.splNaam ? 1 : -1;
        }
        else {
            return a.datum < b.datum ? 1 : -1;
        }
    }

    private setEscapeCount() {
        this.escapeCount = 0;
        if (this.wedLijst.hoveredIdx >= 0) {
            this.escapeCount++;
        }
        if (!this.filtersAreEmpty()) {
            this.escapeCount++;
        }
    }

}
