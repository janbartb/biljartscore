import { Component, HostListener, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { List } from '../../../model/list';
import { NgClass } from '@angular/common';
import { CompNaamDelen } from '../../../model/competitie';
import { Button } from '../../../model/button';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-eigen-competities',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass
    ],
    templateUrl: './eigen-competities.component.html',
    styleUrl: './eigen-competities.component.css'
})
export class EigenCompetitiesComponent extends BaseComponent implements OnInit {
    title: string = 'Spelen';
    subtitle: string = 'Eigen competities';
    compLijst: List<string> = new List<string>();
    buttons: Button[] = [
        new Button('Enter', 'Selecteer', true)
    ];

    override escapePressed(): void {
        if (this.compLijst.hoveredIdx >= 0) {
            this.compLijst.clearSelection();
            this.setEscapeCount();
            return;
        }
        this.router.navigate(['spelkeuze']);
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            this.enterPressed();
        }, 300);
    }

    enterPressed() {
        this.compClicked(this.compLijst.hoveredIdx);
    }

    buttonClicked(idx: number) {
        this.compClicked(idx);
    }

    compClicked(idx: number) {
        this.appData.gotoPage(this.router.url, 'eigencomps/' + this.compLijst.filtered[idx]);
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
                this.compLijst.hoverPreviousItem();
                //this.compScroll.scrollUp(this.compLijst.hoveredIdx);
            }
            if (event.key === 'ArrowDown') {
                this.compLijst.hoverNextItem();
                //this.compScroll.scrollDown(this.compLijst.hoveredIdx);
            }
            this.setEscapeCount();
            return false;
        }
        if (event.key === 'Enter') {
            if (this.compLijst.hoveredIdx >= 0) {
                this.buttonPressed(this.buttons[0]);
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
        if (this.compLijst.hoveredIdx >= 0) {
            this.escapeCount++;
        }
    }
}
