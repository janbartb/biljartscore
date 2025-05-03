import { Component, effect, ElementRef, HostListener, OnInit, viewChild } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { BaseComponent } from '../../base/base.component';
import { List } from '../../model/list';
import { Lokaliteit } from '../../model/vereniging';
import { Scrolling } from '../../model/scrolling';
import { Button } from '../../model/button';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-lokaliteiten',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './lokaliteiten.component.html',
    styleUrl: './lokaliteiten.component.css'
})
export class LokaliteitenComponent extends BaseComponent implements OnInit {
    lokLijst: List<Lokaliteit> = new List<Lokaliteit>();
    naamFilter: string = '';
    plaatsFilter: string = '';
    scrollElm!: HTMLDivElement;
    lokScroll!: Scrolling;

    buttons: Button[] = [
        new Button('+', 'Toevoegen', true)
    ];

    htmlLokLijst = viewChild<ElementRef<HTMLDivElement>>('loklijst');

    constructor() {
        super();
        effect(() => {
            this.htmlLokLijst()?.nativeElement;
        });
    }

    override escapePressed(): void {
        if (this.lokLijst.selectedIdx >= 0) {
            this.lokLijst.clearSelection();
            this.setEscapeCount();
            return;
        }
        // if (this.naamFilter.length) {
        //     this.naamFilter = '';
        //     this.naamFilterChanged();
        //     return;
        // }
        super.escapePressed()
    }

    enterPressed() {
        this.lokaliteitClicked(this.lokLijst.selectedIdx);
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
            this.lokaliteitToevoegenClicked();
        }
    }

    lokaliteitClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.appData.gotoPage(this.router.url, this.router.url + '/' + this.lokLijst.filtered[idx].lokId);
    }

    lokaliteitToevoegenClicked() {
        this.appData.gotoPage(this.router.url, this.router.url + '/toevoegen')
    }

    naamFilterChanged(event?: KeyboardEvent) {
        if (event) {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape') {
                return;
            }    
        }
    }

    plaatsFilterChanged(event?: KeyboardEvent) {
        if (event) {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape') {
                return;
            }    
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
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.lokLijst.selectPreviousItem();
                this.lokScroll.scrollUp(this.lokLijst.selectedIdx);
            }
            if (event.key === 'ArrowDown') {
                this.lokLijst.selectNextItem();
                this.lokScroll.scrollDown(this.lokLijst.selectedIdx);
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
        this.bssApi.getLokaliteiten()
        .then(data => {
            this.lokLijst.fillItems(data);
            this.sortLokaliteiten();

            const elm = this.htmlLokLijst()?.nativeElement;
            if (elm) {
                this.scrollElm = elm;
                new ResizeObserver(() => { 
                    this.initLokLijstScrolling(this.scrollElm);
                }).observe(this.scrollElm);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private setEscapeCount() {

    }

    private sortLokaliteiten() {
        this.lokLijst.filtered.sort((a, b) => {
            if (a.naam == b.naam) {
                return 0;
            }
            return (a.naam > b.naam) ? 1 : -1;
        });
    }

    private initLokLijstScrolling(elm: HTMLDivElement) {
        if (elm) {
            this.lokScroll = new Scrolling(elm, elm.offsetHeight, this.lokLijst.filtered.length);
            console.log('resize event - pos = ' + this.lokScroll.scrollPos);    
        }
    }
}
