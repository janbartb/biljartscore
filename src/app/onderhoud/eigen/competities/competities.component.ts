import { Component, effect, ElementRef, HostListener, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { List } from '../../../model/list';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { Button } from '../../../model/button';
import { Alinea, ConfirmDialog } from '../../../model/dialogs';
import { ConfirmComponent } from '../../../shared/confirm/confirm.component';
import { Scrolling } from '../../../model/scrolling';
import { CompNaamDelen } from '../../../model/competitie';

@Component({
    selector: 'app-competities',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ConfirmComponent,
        NgClass
    ],
    templateUrl: './competities.component.html',
    styleUrl: './competities.component.css'
})
export class CompetitiesComponent extends BaseComponent implements OnInit {
    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Eigen competities';
    compLijst: List<string> = new List<string>();
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);
    idxToDelete: number = -1;
    scrollElm!: HTMLDivElement;
    compScroll!: Scrolling;

    buttons: Button[] = [
        new Button('+', 'Toevoegen', true)
    ];

    htmlCompLijst = viewChild<ElementRef<HTMLDivElement>>('complijst');

    constructor() {
        super();
        effect(() => {
            this.htmlCompLijst()?.nativeElement;
        });
    }

    override escapePressed(): void {
        if (this.compLijst.selectedIdx >= 0) {
            this.compLijst.clearSelection();
            this.setEscapeCount();
            return;
        }
        super.escapePressed()
    }

    enterPressed() {
        this.compClicked(this.compLijst.selectedIdx);
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
            this.compToevoegenClicked();
        }
    }

    compClicked(idx: number) {
        this.appData.gotoPage(this.router.url, 'onderhoud/eigencomp/' + this.compLijst.filtered[idx]);
    }

    compToevoegenClicked() {
        this.appData.gotoPage(this.router.url, 'onderhoud/eigencomp/toevoegen');
    }

    compVerwijderenClicked(idx: number, event?: MouseEvent) {
        event?.stopPropagation();
        if (idx < 0) {
            return;
        }
        this.idxToDelete = idx;
        this.confirmVerwijderen(this.idxToDelete);
    }

    private confirmVerwijderen(idx: number) {
        const toDelete = this.compLijst.filtered[idx];
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Competitie '${toDelete}' verwijderen.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        if (confirmed) {
            const naam = this.compLijst.filtered[this.idxToDelete];
            this.bssApi.deleteCompetitie(naam)
            .then(resp1 => {
                this.alert.showAlert(`Eigen competitie '${naam}' is verwijderd.`, 'success');
                this.getCompetitieList();
                this.isDialogOpen = false;
            })
            .catch(err => {
                this.alert.showError(err);
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
        if (this.isDialogOpen) {
            return false;
        }
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.compLijst.selectPreviousItem();
                this.compScroll.scrollUp(this.compLijst.selectedIdx);
            }
            if (event.key === 'ArrowDown') {
                this.compLijst.selectNextItem();
                this.compScroll.scrollDown(this.compLijst.selectedIdx);
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
        this.getCompetitieList();
    }

    private getCompetitieList() {
        this.bssApi.getCompetitieList(this.spelId)
        .then(data => {
            data.sort(this.compareNamen);
            this.compLijst.fillItems(data);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private compareNamen(naamA: string, naamB: string): number {
        const a = new CompNaamDelen(naamA);
        const b = new CompNaamDelen(naamB);
        if (a.cmpJaar == b.cmpJaar) {
            if (a.cmpVolgNr == b.cmpVolgNr) {
                return a.cmpType > b.cmpType ? 1 : -1;
            }
            else {
                return b.cmpVolgNr - a.cmpVolgNr;
            }
        }
        else {
            return b.cmpJaar - a.cmpJaar;
        }
    }

    private setEscapeCount() {
        this.escapeCount = 0;
        if (this.compLijst.selectedIdx >= 0) {
            this.escapeCount++;
        }
    }
}
