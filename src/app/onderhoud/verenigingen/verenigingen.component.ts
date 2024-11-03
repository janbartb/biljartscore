import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { BaseComponent } from '../../base/base.component';
import { List } from '../../model/list';
import { VerenigingWrapper } from '../../model/vereniging';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { Button } from '../../model/button';

@Component({
    selector: 'app-verenigingen',
    standalone: true,
    imports: [
        PageHeaderComponent, 
        ButtonComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './verenigingen.component.html',
    styleUrl: './verenigingen.component.css'
})
export class VerenigingenComponent extends BaseComponent implements OnInit {
    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Verenigingen';
    thisUrl = 'onderhoud/verenigingen';

    verenigingLijst: List<VerenigingWrapper> = new List<VerenigingWrapper>();
    naamFilter: string = '';
    addButton: Button = new Button('', '');

    enterPressed() {
        if (this.verenigingLijst.isItemSelected()) {
            this.verenigingClicked(this.verenigingLijst.selectedIdx);
        }
    }

    buttonPressed(key: string) {
        if (key == '+') {
            this.addButton.selected = true;
            setTimeout(() => {
                this.addButton.selected = false;
                this.verenigingToevoegenClicked();
            }, 500);
        }
    }

    verenigingClicked(idx: number) {
        this.verenigingLijst.selectItem(idx);
        this.appData.gotoPage(this.thisUrl, this.thisUrl + '/' + this.verenigingLijst.getItem(idx)?.vereniging.verId)
    }

    verenigingToevoegenClicked() {
        this.appData.gotoPage(this.thisUrl, this.thisUrl + '/toevoegen')
    }

    naamFilterChanged(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape') {
            return;
        }
        this.filtersChanged();
        this.sortVerenigingen();
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

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.verenigingLijst.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.verenigingLijst.selectNextItem();
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
        if (event.key === '+' || event.key === '=') {
            this.buttonPressed('+');
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
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
        this.addButton = new Button('+', 'Vereniging toevoegen', true);
    }
}
