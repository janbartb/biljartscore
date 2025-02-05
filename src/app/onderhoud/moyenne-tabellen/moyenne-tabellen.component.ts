import { Component, HostListener, OnInit } from '@angular/core';
import { List } from '../../model/list';
import { MoyenneTabel, MoyenneTabelEntry } from '../../model/moyenne-tabel';
import { BaseComponent } from '../../base/base.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { Button } from '../../model/button';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { MoyenneTabelComponent } from './moyenne-tabel/moyenne-tabel.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Alinea, ConfirmDialog } from '../../model/dialogs';

@Component({
    selector: 'app-moyenne-tabellen',
    standalone: true,
    imports: [
        PageHeaderComponent, 
        NgClass, 
        ButtonComponent, 
        MoyenneTabelComponent,
        ConfirmComponent
    ],
    templateUrl: './moyenne-tabellen.component.html',
    styleUrl: './moyenne-tabellen.component.css'
})
export class MoyenneTabellenComponent extends BaseComponent implements OnInit {
    subtitle: string = 'KNBB klassen en moyennes';
    sectionTitle: string = 'Moyenne tabel';
    menuLijst: List<string> = new List<string>();
    moyenneTabel: MoyenneTabel = new MoyenneTabel();
    enterButton: Button = new Button('Enter', 'Voeg een klasse toe', true);
    verwijderButton: Button = new Button('Del', 'Verwijderen', true);

    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    enterPressed() {
        this.enterClicked();
    }

    verwijderenPressed() {
        if (this.menuLijst.selectedIdx < 1) {
            return;
        }
        this.verwijderenClicked();
    }

    buttonPressed(event: KeyboardEvent, button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.enterPressed();
            }
            else if (button.key == 'Del') {
                this.verwijderenPressed();
            }
        }, 300);
    }

    enterClicked() {
        if (this.enterButton.text == 'Wijzigen') {
            this.klasseWijzigenClicked();
        }
        else {
            this.klasseToevoegenClicked();
        }
    }

    menuClicked(idx: number) {
        if (idx == 0) {
            this.toevoegenClicked();
        }
        else {
            this.klasseClicked(idx);
        }
    }

    klasseClicked(idx: number) {
        this.enterButton.text = 'Wijzigen';
        this.menuLijst.selectItem(idx);
        this.getMoyenneTabel(this.menuLijst.getSelectedItem() || '');
    }

    toevoegenClicked() {
        this.enterButton.text = 'Voeg een klasse toe';
        this.menuLijst.selectItem(0);
    }

    klasseToevoegenClicked() {
        console.log('Klasse toevoegen');
        this.appData.gotoPage(this.router.url, this.router.url + `/toevoegen`);
    }

    klasseWijzigenClicked() {
        console.log('Klasse wijzigen');
        const klasse = this.menuLijst.getSelectedItem();
        if (klasse) {
            this.appData.gotoPage(this.router.url, this.router.url + `/${klasse}`);
        }
        else {
            this.alert.showError('Er is geen klasse geselecteerd om te wijzigen.');
        }
    }

    verwijderenClicked() {
        console.log('Klasse verwijderen');
        const klasse = this.menuLijst.getSelectedItem();
        if (klasse) {
            this.confirmKlasseVerwijderen(klasse);
        }
        else {
            this.alert.showError('Er is geen klasse geselecteerd om te verwijderen.');
        }
    }

    private confirmKlasseVerwijderen(klasse: string) {
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Klasse '${klasse}' en moyenne tabel verwijderen.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        console.log('confirmed : ' + confirmed);
        if (confirmed) {
            const klasse = this.menuLijst.getSelectedItem();
            if (klasse) {
                const id = this.spelId + '-' + klasse;
                this.bssApi.deleteMoyenneTabel(id)
                .then(resp => {
                    this.alert.showAlert(resp.message, 'success');
                    this.ngOnInit();
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            }
            else {
                this.alert.showError('Er is geen klasse geselecteerd om te verwijderen.');
            }
        }
        this.isDialogOpen = false;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        if (this.isDialogOpen) {
            return false;
        }
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.menuLijst.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.menuLijst.selectNextItem();
            }
            if (this.menuLijst.selectedIdx > 0) {
                this.klasseClicked(this.menuLijst.selectedIdx);
            }
            else {
                this.toevoegenClicked();
            }
            return false;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(event, this.enterButton);
            return false;
        }
        if (event.key === 'Delete') {
            this.buttonPressed(event, this.verwijderButton);
            return false;
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
        let menu: string[] = ['Nieuw...'];
        this.enterButton.text = 'Voeg een klasse toe';
        this.bssApi.getMoyenneKlassenLijst(this.spelId)
            .then(data => {
                console.log(data);
                data.sort(this.compareKlassen);
                menu = menu.concat(data);
                this.menuLijst.fillItems(menu);
                this.menuLijst.selectItem(0);
            })
            .catch(err => {
                this.alert.showError(err);
            });
    }

    private getMoyenneTabel(klasse: string) {
        if (!klasse.length) {
            this.alert.showError(`Kan tabel met lege klasse niet ophalen. (index = ${this.menuLijst.selectedIdx})`);
            return;
        }
        const id = this.spelId + '-' + klasse;
        this.bssApi.getMoyenneTabel(id)
            .then(result => {
                result.moyennes.sort(this.compareMoyennes);
                this.aanvullenTabel(result);
                this.moyenneTabel = result;
            })
            .catch(err => {
                this.alert.showError(err);
            });
    }

    private compareKlassen(a: string, b: string): number {
        if (a == b) {
            return 0;
        }
        return (a < b) ? -1 : 1;
    }

    private compareMoyennes(a: MoyenneTabelEntry, b: MoyenneTabelEntry): number {
        if (a.vanaf == b.vanaf) {
            return a.cars - b.cars;
        }
        return a.vanaf - b.vanaf;
    }

    private aanvullenTabel(tabel: MoyenneTabel): void {
        const aantalErbij = 40 - tabel.moyennes.length;
        if (aantalErbij <= 0) {
            return;
        }
        for (let i = 0; i < aantalErbij; i++) {
            tabel.moyennes.push(new MoyenneTabelEntry());
        }
    }

}
