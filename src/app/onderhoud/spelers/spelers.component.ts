import { Component, HostListener, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { SpelerWrapper } from '../../model/speler';
import { FormsModule } from '@angular/forms';
import { Vereniging, VerenigingKort } from '../../model/vereniging';
import { List } from '../../model/list';
import { Button } from '../../model/button';
import { ButtonComponent } from "../../shared/button-group/button/button.component";
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'app-spelers',
  standalone: true,
  imports: [PageHeaderComponent, FormsModule, NgClass, ButtonComponent],
  templateUrl: './spelers.component.html',
  styleUrl: './spelers.component.css'
})
export class SpelersComponent extends BaseComponent {
    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Spelers';

    spelerList: List<SpelerWrapper> = new List<SpelerWrapper>();
    verenigingen: VerenigingKort[] = [];
    naamFilter: string = '';
    verenigingFilter: string = '';
    addButton: Button = new Button('', '');

    enterPressed() {
        if (this.spelerList.isItemSelected()) {
            this.spelerClicked(this.spelerList.selectedIdx);
        }
    }

    buttonPressed(key: string) {
        if (key == '+') {
            this.spelerToevoegenClicked();
        }
    }

    spelerClicked(idx: number) {
        this.spelerList.selectItem(idx);
        this.router.navigate(['onderhoud/spelers', this.spelerList.getItem(idx)?.speler.id]);
    }

    spelerToevoegenClicked() {
        this.router.navigate(['onderhoud/spelers', 'toevoegen']);
    }

    naamFilterChanged(event: KeyboardEvent) {
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown' || event.key ==='Enter' || event.key ==='Escape') {
            return;
        }
        this.filtersChanged();
    }

    verenigingFilterChanged() {
        this.filtersChanged();
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
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.spelerList.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.spelerList.selectNextItem();
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
        this.previousUrl = 'onderhoud';
        this.bssApi.getVerenigingen()
            .then((resp: Vereniging[]) => {
                this.verenigingen = resp.map(ver => new VerenigingKort(ver));
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
        this.bssApi.getSpelers()
            .then((resp: SpelerWrapper[]) => {
                this.spelerList.fillItems(resp);
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
        
        this.addButton = new Button('+', 'Speler toevoegen', true);
    }

    getKorteVerenigingNaam(id: string): string {
        const found = this.verenigingen.find(ver => ver.id == id);
        return found ? found.korteNaam : '';
    }
}
