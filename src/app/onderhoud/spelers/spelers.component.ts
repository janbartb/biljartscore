import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild, ViewChild } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { Speler, SpelerWrapper } from '../../model/speler';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Vereniging, VerenigingKort } from '../../model/vereniging';
import { List } from '../../model/list';
import { Button } from '../../model/button';
import { BaseComponent } from '../../base/base.component';
import { Spelsoort } from '../../model/spelsoort';
import { ApiResponse } from '../../model/api-response';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { HelperService } from '../../services/helper.service';
import { Scrolling } from '../../model/scrolling';

@Component({
  selector: 'app-spelers',
  standalone: true,
  imports: [
    PageHeaderComponent, 
    SectionFooterBtnsComponent,
    FormsModule, 
    NgClass, 
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl: './spelers.component.html',
  styleUrl: './spelers.component.css'
})
export class SpelersComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Spelers';
    thisUrl: string = 'onderhoud/spelers';

    spelerList: List<SpelerWrapper> = new List<SpelerWrapper>();
    verenigingen: Vereniging[] = [];
    spelsoorten: Spelsoort[] = [];
    naamFilterInit: string = localStorage.getItem('spelersNaamFilter') || '';
    naamFilter: string = localStorage.getItem('spelersNaamFilter') || '';
    verenigingFilterInit: string = '';
    verenigingFilter: string = '';
    moyenneMode: boolean = false;
    moyenneEdit: number = 0;
    escapeCount: number = 0;
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
        this.appData.gotoPage(this.thisUrl, this.thisUrl + '/' + this.spelerList.getItem(idx)?.speler.id);
    }

    spelerToevoegenClicked() {
        this.appData.gotoPage(this.thisUrl, this.thisUrl + '/toevoegen');
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

    moyennesWijzigenClicked() {
        if (!this.spelerList.filtered.length) {
            return;
        }
        this.moyenneMode = !this.moyenneMode;
        if (!this.moyenneMode) {
            this.buttons[1].selected = false;
            this.spelerList.clearSelection();
            this.sortSpelers();
        }
        else {
            this.buttons[1].selected = true;
            const idx = this.spelerList.selectedIdx < 0 ? 0 : this.spelerList.selectedIdx;
            this.spelerList.selectItem(idx);
            this.moyenneEdit = this.spelerList.getSelectedItem()?.getGemiddeldeVanSpel() || 0;
            setTimeout(() => {
                this.myInput.nativeElement.select();
            }, 200);
        }
        this.setEscapeCount();
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
        this.filtersChanged();
        this.sortSpelers();
        this.htmlVerFilter()?.nativeElement.blur();
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
        if (event.code === 'Equal' || event.code === 'NumpadAdd') {
            this.buttonPressed(0);
            return false;
        }
        if (event.code === 'KeyM') {
            if (fromInput && (<HTMLInputElement> event.target).id == 'naamfilter') {
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
        this.verenigingFilter = this.verenigingFilterInit = localStorage.getItem('spelersVerenigingFilter') || config.vereniging;
        Promise.all([
            this.bssApi.getVerenigingen(),
            this.bssApi.getSpelersLijst(this.spelId),
            this.bssApi.getSpelsoorten()
        ])
        .then(results => {
            this.verenigingen = results[0];
            this.spelerList.fillItems(results[1]);
            this.spelsoorten = results[2];
            if (this.verenigingFilter != '') {
                this.filtersChanged();
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

    private setEscapeCount() {
        this.escapeCount = 0;
        if (this.moyenneMode) {
            this.escapeCount++;
        }
        if (this.naamFilter != this.naamFilterInit) {
            this.escapeCount++;
        }
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
