import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { MoyenneTabelEntriesComponent } from '../moyenne-tabel-entries/moyenne-tabel-entries.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { BaseComponent } from '../../../base/base.component';
import { MoyenneEntryToAdd, MoyenneEntryToEdit, MoyenneTabel, MoyenneTabelEntry } from '../../../model/moyenne-tabel';
import { HelperService } from '../../../services/helper.service';
import { Button } from '../../../model/button';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-moyenne-tabel-add',
    standalone: true,
    imports: [
        MoyenneTabelEntriesComponent,
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './moyenne-tabel-add.component.html',
    styleUrl: './moyenne-tabel-add.component.css'
})
export class MoyenneTabelAddComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    subtitle: string = 'KNBB klassen en moyennes';
    sectionTitle: string = 'Klasse en moyenne tabel toevoegen';

    tabel: MoyenneTabel = new MoyenneTabel();
    existing: string[] = [];
    entryToAdd: MoyenneEntryToAdd = new MoyenneEntryToAdd();
    entryToEdit: MoyenneEntryToEdit = new MoyenneEntryToEdit();
    idxSelected: number = -1;
    klasseValid: boolean = false
    minimumValid: boolean = false;
    escapeCount: number = 0;

    buttons: Button[] = [
        new Button('Del', 'Entry verwijderen', true),
        new Button('Enter', 'Tabel opslaan', true)
    ];

    htmlInputKlasse = viewChild<ElementRef<HTMLInputElement>>("klasse");
    htmlInputMinimum = viewChild<ElementRef<HTMLInputElement>>("minimum");
    htmlInputVanaf = viewChild<ElementRef<HTMLInputElement>>("vanaf");
    htmlInputCars = viewChild<ElementRef<HTMLInputElement>>("cars");

    constructor() {
        super();
        effect(() => {
            this.htmlInputKlasse()?.nativeElement.focus();
        });
    }

    enterPressed(event: KeyboardEvent) {
        this.enterClicked();
    }

    override escapePressed(): void {
        if (this.entryToAdd.entry.vanaf != 0 || this.entryToAdd.entry.cars != 0) {
            this.resetAddClicked();
            return;
        }
        if (this.idxSelected >= 0) {
            this.resetSelection();
            return;
        }
        if (this.tabel.klasse != '' || this.tabel.minimum != 0 || this.tabel.moyennes.length) {
            this.resetTabel();
            return;
        }
        super.escapePressed();
    }

    buttonPressed(event: KeyboardEvent, button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.enterPressed(event);
            }
            else if (button.key == 'Del') {
                this.deletePressed(event);
            }
        }, 300);
    }

    deletePressed(event: KeyboardEvent) {
        event.stopPropagation();
        this.deleteClicked();
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.deleteClicked();
        }
        else if (idx == 1) {
            this.enterClicked();
        }
    }

    enterClicked() {
        if (!this.minimumValid) {
            return;
        }
        if (this.idxSelected >= 0 && !this.entryToEdit.carsValid) {
            return;
        }
        switch (this.buttons[1].text) {
            case 'Tabel opslaan':
                this.tabelOpslaan();
                break;
            case 'Entry toevoegen':
                this.entryToevoegen();
                break;
            case 'Entry wijzigen':
                this.entryWijzigen();
                break;            
            default:
                console.log('Onbekend!!!');
                break;
        }
    }

    resetAddClicked() {
        this.entryToAdd = new MoyenneEntryToAdd();
        this.htmlInputKlasse()?.nativeElement.blur();
        this.htmlInputVanaf()?.nativeElement.blur();
        this.htmlInputCars()?.nativeElement.blur();
        this.htmlInputMinimum()?.nativeElement.blur();
        this.idxSelected = -1;
        this.buttons[1].text = 'Tabel opslaan';
        this.setEscapeCount();
    }

    deleteClicked() {
        this.verwijderenEntry(this.idxSelected);
    }

    entryClicked(idx: number) {
        this.idxSelected = idx;
        let temp = new MoyenneEntryToEdit();
        if (idx >= 0) {
            Object.assign(temp.entry, this.tabel.moyennes[idx]);
            temp.carsValid = true;
            temp.index = this.idxSelected;
            this.buttons[1].text = 'Entry wijzigen';
        }
        else {
            this.buttons[1].text = 'Tabel opslaan';
        }
        this.entryToEdit = temp;
        this.entryToAdd = new MoyenneEntryToAdd();
        this.setEscapeCount();
    }

    tabelOpslaan() {
        this.tabel.spelsoort = this.spelId;
        this.tabel.tabId = this.tabel.spelsoort + '-' + this.tabel.klasse;
        this.tabel.moyennes = this.getOnlyFilledEntries();
        this.bssApi.addMoyenneTabel(this.tabel)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            super.escapePressed();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    entryToevoegen() {
        if (!(this.entryToAdd.vanafValid && this.entryToAdd.carsValid)) {
            return;
        }
        const entry: MoyenneTabelEntry = new MoyenneTabelEntry();
        Object.assign(entry, this.entryToAdd.entry);
        entry.filled = true;
        let entries = this.getOnlyFilledEntries();
        entries.push(entry);
        entries.sort(this.compareMoyennes);
        this.aanvullenEntries(entries);
        this.tabel.moyennes = entries;
        this.entryToAdd = new MoyenneEntryToAdd();
        this.entryToAdd.entry.vanaf = entry.vanaf;
        this.entryToAdd.entry.cars = entry.cars;
        this.validateEntryToAdd();
        setTimeout(() => {
            this.htmlInputVanaf()?.nativeElement.focus();
        }, 200);
    }

    entryWijzigen() {
        if (!this.entryToEdit.carsValid) {
            return;
        }
        this.tabel.moyennes[this.idxSelected].cars = this.entryToEdit.entry.cars;
        this.changeEntrySelection(1);
    }

    resetSelectionAndToAdd() {
        this.resetSelection();
        this.entryToAdd = new MoyenneEntryToAdd();
        this.setEscapeCount();
    }

    resetSelection() {
        this.entryToEdit = new MoyenneEntryToEdit();
        this.idxSelected = -1;
        this.buttons[1].text = 'Tabel opslaan';
        this.setEscapeCount();
    }

    resetTabel() {
        this.tabel = new MoyenneTabel();
        this.aanvullenEntries(this.tabel.moyennes);
        this.klasseChanged();
        this.minimumChanged();
    }

    verwijderenEntry(idx: number): void {
        this.tabel.moyennes.push(new MoyenneTabelEntry());
        this.tabel.moyennes.splice(idx, 1);
        this.resetSelection();
    }

    validateEntryToAdd() {
        this.buttons[1].text = 'Tabel opslaan';
        // validate vanaf
        if (!this.helper.isValidNumber('' + this.entryToAdd.entry.vanaf)) {
            this.entryToAdd.vanafValid = false;
        }
        else {
            this.entryToAdd.vanafValid = !this.tabel.moyennes.some(moy => moy.vanaf == this.entryToAdd.entry.vanaf);
        }
        // validate cars
        this.entryToAdd.carsValid = this.helper.isValidInteger('' + this.entryToAdd.entry.cars) && this.entryToAdd.entry.cars > this.tabel.minimum;
        // validate both
        if (!(this.entryToAdd.vanafValid && this.entryToAdd.carsValid)) {
            this.setEscapeCount();
            return;
        }
        const entry: MoyenneTabelEntry = new MoyenneTabelEntry();
        Object.assign(entry, this.entryToAdd.entry);
        let entries = this.getOnlyFilledEntries();
        entries.push(entry);
        entries.sort(this.compareMoyennes);
        this.entryToAdd.vanafValid = entries.every((entry, i) => {
            if (i === entries.length - 1 || entry.vanaf < entries[i + 1].vanaf) {
                return true;
            }
            return false;
        });
        if (!this.entryToAdd.vanafValid) {
            this.setEscapeCount();
            return;
        }
        this.entryToAdd.carsValid = entries.every((entry, i) => {
            if (i === entries.length - 1 || entry.cars < entries[i + 1].cars) {
                return true;
            }
            return false;
        });
        if (this.entryToAdd.vanafValid && this.entryToAdd.carsValid) {
            this.buttons[1].text = 'Entry toevoegen';
        }
        this.setEscapeCount();
    }

    changeEntrySelection(direction: number) {
        const lastEntryIdx = this.getOnlyFilledEntries().length - 1;
        if (lastEntryIdx < 0) {
            return;
        }
        let idx = this.idxSelected;
        idx += direction;
        if (idx < 0) {
            idx = lastEntryIdx;
        }
        else if (idx > lastEntryIdx) {
            idx = 0;
        }
        this.entryClicked(idx);
        this.setEscapeCount();
    }

    klasseChanged() {
        const temp = this.tabel.klasse.trim();
        this.klasseValid = temp.length > 0 && !this.existing.some(kl => kl == temp);
        this.setEscapeCount();
    }

    minimumChanged() {
        this.setEscapeCount();
        this.minimumValid = this.helper.isValidInteger('' + this.tabel.minimum);
        if (!this.minimumValid) {
            return;
        }
        const entries = this.getOnlyFilledEntries();
        if (!entries.length) {
            return;
        }
        if (this.tabel.minimum >= entries[0].cars) {
            this.minimumValid = false;
            return;
        }
        if (this.entryToAdd.entry.cars > 0) {
            this.entryToAdd.carsValid = this.entryToAdd.entry.cars > this.tabel.minimum;
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (this.inNumberInput(event)) {
                return true;
            }
            if (event.key === 'ArrowUp') {
                this.changeEntrySelection(-1);
            }
            if (event.key === 'ArrowDown') {
                this.changeEntrySelection(1);
            }
            return false;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(event, this.buttons[1]);
            return false;
        }
        if (event.key === 'Delete') {
            this.buttonPressed(event, this.buttons[0]);
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
        if (this.spelId == '') {
            this.alert.showError('Gekozen spel is leeg. Ga terug naar de Home pagina.');
            return;
        }
        this.aanvullenEntries(this.tabel.moyennes);
        this.bssApi.getMoyenneKlassenLijst(this.spelId)
        .then(result => {
            this.existing = result;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private inNumberInput(event: KeyboardEvent): boolean {
        if (event.target instanceof HTMLInputElement) {
            const target = <HTMLInputElement>event.target;
            if (target.type == 'number') {
                return true;
            }
        }
        return false;
    }

    private compareMoyennes(a: MoyenneTabelEntry, b: MoyenneTabelEntry): number {
        if (a.vanaf == b.vanaf) {
            return a.cars - b.cars;
        }
        return a.vanaf - b.vanaf;
    }

    private aanvullenEntries(entries: MoyenneTabelEntry[]): void {
        const aantalErbij = 40 - entries.length;
        if (aantalErbij <= 0) {
            return;
        }
        for (let i = 0; i < aantalErbij; i++) {
            entries.push(new MoyenneTabelEntry());
        }
    }

    private getOnlyFilledEntries(): MoyenneTabelEntry[] {
        return this.tabel.moyennes.filter(e => e.filled);
    }

    private setEscapeCount() {
        this.escapeCount = 0;
        if (this.tabel.klasse != '' || this.tabel.minimum != 0 || this.tabel.moyennes[0].vanaf != 0) {
            this.escapeCount++;
        }
        if (this.idxSelected >= 0) {
            this.escapeCount++;
        }
        if (this.entryToAdd.entry.vanaf != 0 || this.entryToAdd.entry.cars != 0) {
            this.escapeCount++;
        }
    }
}
