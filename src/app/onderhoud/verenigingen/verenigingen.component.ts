import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { BaseComponent } from '../../base/base.component';
import { List } from '../../model/list';
import { VerenigingWrapper } from '../../model/vereniging';
import { FormsModule } from '@angular/forms';
import { Button } from '../../model/button';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { HelperService } from '../../services/helper.service';
import { Scrolling } from '../../model/scrolling';

@Component({
    selector: 'app-verenigingen',
    standalone: true,
    imports: [
        PageHeaderComponent, 
        SectionFooterBtnsComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './verenigingen.component.html',
    styleUrl: './verenigingen.component.css'
})
export class VerenigingenComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Verenigingen';
    thisUrl = 'onderhoud/verenigingen';
    verenigingLijst: List<VerenigingWrapper> = new List<VerenigingWrapper>();
    naamFilter: string = '';
    escapeCount: number = 0;
    scrollElm!: HTMLDivElement;
    verScroll!: Scrolling;

    buttons: Button[] = [
        new Button('+', 'Toevoegen', true)
    ];

    htmlVerLijst = viewChild<ElementRef<HTMLDivElement>>('vereniginglijst');

    constructor() {
        super();
        effect(() => {
            this.htmlVerLijst()?.nativeElement;
        });
    }

    override escapePressed(): void {
        if (this.verenigingLijst.selectedIdx >= 0) {
            this.verenigingLijst.clearSelection();
            this.setEscapeCount();
            return;
        }
        if (this.naamFilter.length) {
            this.naamFilter = '';
            this.naamFilterChanged();
            return;
        }
        super.escapePressed()
    }

    enterPressed() {
        this.verenigingClicked(this.verenigingLijst.selectedIdx);
    }

    buttonPressed(idx: number) {
        this.buttons[idx].selected = true;
        setTimeout(() => {
            this.buttons[idx].selected = false;
            this.buttonClicked(idx);
        }, 500);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.verenigingToevoegenClicked();
        }
    }

    verenigingClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.verenigingLijst.selectItem(idx);
        this.appData.gotoPage(this.thisUrl, this.thisUrl + '/' + this.verenigingLijst.getItem(idx)?.vereniging.verId)
    }

    verenigingToevoegenClicked() {
        this.appData.gotoPage(this.thisUrl, this.thisUrl + '/toevoegen')
    }

    naamFilterChanged(event?: KeyboardEvent) {
        if (event) {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape') {
                return;
            }    
        }
        this.verenigingLijst.clearSelection();
        this.filtersChanged();
        this.sortVerenigingen();
        this.initVerLijstScrolling(this.scrollElm);
        this.setEscapeCount();
    }

    filtersChanged() {
        if (!this.naamFilter.length) {
            this.verenigingLijst.filter((item: VerenigingWrapper) => { return true; });
            return;
        }
        this.verenigingLijst.filter((item: VerenigingWrapper) => {
            return item.vereniging.naam.toLowerCase().indexOf(this.naamFilter.toLowerCase()) >= 0;
        });
    }

    sortVerenigingen() {
        this.verenigingLijst.filtered.sort((a, b) => {
            if (a.vereniging.naam == b.vereniging.naam) {
                return 0;
            }
            return (a.vereniging.naam > b.vereniging.naam) ? 1 : -1;
        });
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
                this.verenigingLijst.selectPreviousItem();
                this.verScroll.scrollUp(this.verenigingLijst.selectedIdx);
            }
            if (event.key === 'ArrowDown') {
                this.verenigingLijst.selectNextItem();
                this.verScroll.scrollDown(this.verenigingLijst.selectedIdx);
            }
            this.setEscapeCount();
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
        if (event.key === '+' || event.key === '=') {
            this.buttonPressed(0);
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }    
        return true;
    }

    ngOnInit(): void {
        this.bssApi.getVerenigingenLijst()
            .then(result => {
                this.verenigingLijst.fillItems(result);
                this.sortVerenigingen();
                const elm = this.htmlVerLijst()?.nativeElement;
                if (elm) {
                    this.scrollElm = elm;
                    new ResizeObserver(() => { 
                        this.initVerLijstScrolling(this.scrollElm);
                    }).observe(this.scrollElm);
                }
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
    }

    private setEscapeCount() {
        this.escapeCount = 0;
        if (this.verenigingLijst.selectedIdx >= 0) {
            this.escapeCount++;
        }
        if (this.naamFilter.length) {
            this.escapeCount++;
        }
    }

    private initVerLijstScrolling(elm: HTMLDivElement) {
        if (elm) {
            if (this.verenigingLijst.hoveredIdx >= 0) {
                this.verenigingLijst.hoveredIdx = 0;
            }
            this.verScroll = new Scrolling(elm, elm.offsetHeight, this.verenigingLijst.filtered.length);
            console.log('resize event - pos = ' + this.verScroll.scrollPos);    
        }
    }
}
