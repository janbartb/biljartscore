import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { Speler, SpelerWrapper } from '../../model/speler';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Vereniging, VerenigingKort } from '../../model/vereniging';
import { List } from '../../model/list';
import { Button } from '../../model/button';
import { ButtonComponent } from "../../shared/button-group/button/button.component";
import { BaseComponent } from '../../base/base.component';
import { Spelsoort } from '../../model/spelsoort';
import { ApiResponse } from '../../model/api-response';

@Component({
  selector: 'app-spelers',
  standalone: true,
  imports: [
    PageHeaderComponent, 
    FormsModule, 
    NgClass, 
    ButtonComponent,
    DecimalPipe,
    ReactiveFormsModule
  ],
  templateUrl: './spelers.component.html',
  styleUrl: './spelers.component.css'
})
export class SpelersComponent extends BaseComponent {
    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Spelers';
    thisUrl: string = 'onderhoud/spelers';

    spelerList: List<SpelerWrapper> = new List<SpelerWrapper>();
    verenigingen: Vereniging[] = [];
    spelsoorten: Spelsoort[] = [];
    naamFilter: string = localStorage.getItem('spelersNaamFilter') || '';
    verenigingFilter: string = '';
    moyenneMode: boolean = false;
    moyenneEdit: number = 0;
    addButton: Button = new Button('', '');
    moyButton: Button = new Button('', '');

    //htmlInputId = viewChild<ElementRef<HTMLInputElement>>("moyenne");
    @ViewChild('moyenne', { static: false }) myInput!: ElementRef<HTMLInputElement>;

    enterPressed() {
        if (this.spelerList.isItemSelected()) {
            this.spelerClicked(this.spelerList.selectedIdx);
        }
    }

    override escapePressed(): void {
        if (this.moyenneMode) {
            this.moyButton.selected = false;
            this.moyenneMode = false;
            this.spelerList.clearSelection();
            this.sortSpelers();
        }
        else {
            super.escapePressed();
        }
    }

    buttonPressed(key: string) {
        if (key == '+' || key == '=') {
            this.addButton.selected = true;
            setTimeout(() => {
                this.addButton.selected = false;
                this.spelerToevoegenClicked();
            }, 250);
        }
        if (key == 'm') {
            this.moyennesWijzigenClicked();
        }
    }

    spelerClicked(idx: number) {
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
            this.moyButton.selected = false;
            this.spelerList.clearSelection();
            this.sortSpelers();
        }
        else {
            this.moyButton.selected = true;
            this.spelerList.selectItem(0);
            this.moyenneEdit = this.spelerList.getSelectedItem()?.getGemiddeldeVanSpel() || 0;
            setTimeout(() => {
                this.myInput.nativeElement.select();
            }, 200);
        }
    }

    keydownMoyenne(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
        if (event.key === 'm' || event.key === '+' || event.key === '=') {
            event.preventDefault();
            event.stopPropagation();
            if (event.key == 'm') {
                this.buttonPressed('m');
            }
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
            this.spelerClicked(this.spelerList.selectedIdx);
        }
    }

    naamFilterChanged(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape') {
            return;
        }
        localStorage.setItem('spelersNaamFilter', this.naamFilter);
        this.filtersChanged();
        this.sortSpelers();
    }

    verenigingFilterChanged() {
        localStorage.setItem('spelersVerenigingFilter', this.verenigingFilter);
        this.filtersChanged();
        this.sortSpelers();
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
        if (event.key === '+' || event.key === '=' || event.key === 'm') {
            this.buttonPressed(event.key);
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
        this.verenigingFilter = localStorage.getItem('spelersVerenigingFilter') || config.vereniging;
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
        })
        .catch((err) => {
            this.alert.showAlert(err, 'error');
        });
        this.addButton = new Button('+', 'Speler toevoegen', true);
        this.moyButton = new Button('M', 'Moyennes wijzigen', true);
    }

    private removeFromSpelerList(speler: Speler): void {
        const idx = this.spelerList.items.findIndex(item => item.speler.id == speler.id);
        if (idx >= 0) {
            this.spelerList.items.splice(idx, 1);
            this.filtersChanged();
            this.sortSpelers();
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
