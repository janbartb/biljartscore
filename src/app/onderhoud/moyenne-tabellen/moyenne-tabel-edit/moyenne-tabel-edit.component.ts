import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { HelperService } from '../../../services/helper.service';
import { MoyenneEntryToAdd, MoyenneEntryToEdit, MoyenneTabel, MoyenneTabelEntry } from '../../../model/moyenne-tabel';
import { Button } from '../../../model/button';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { MoyenneTabelEntriesComponent } from '../moyenne-tabel-entries/moyenne-tabel-entries.component';

@Component({
    selector: 'app-moyenne-tabel-edit',
    standalone: true,
    imports: [
        MoyenneTabelEntriesComponent,
        PageHeaderComponent,
        ButtonComponent, 
        FormsModule, 
        NgClass
    ],
    templateUrl: './moyenne-tabel-edit.component.html',
    styleUrl: './moyenne-tabel-edit.component.css'
})
export class MoyenneTabelEditComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);
    route = inject(ActivatedRoute);

    subtitle: string = 'KNBB klassen en moyenne tabellen';
    sectionTitle: string = 'Wijzigen moyenne tabel';

    tabel: MoyenneTabel = new MoyenneTabel();
    entryToAdd: MoyenneEntryToAdd = new MoyenneEntryToAdd();
    entryToEdit: MoyenneEntryToEdit = new MoyenneEntryToEdit();
    inpMinimum: number = 0;
    idxSelected: number = -1;
    minimumValid: boolean = true;

    enterButton: Button = new Button('Enter', 'Tabel opslaan', true);
    deleteButton: Button = new Button('Del', 'Entry verwijderen', true);
    resetButton: Button = new Button('Esc', 'Reset', true);
    resetMinButton: Button = new Button('Esc', 'Reset', false);

    htmlInputMinimum = viewChild<ElementRef<HTMLInputElement>>("minimum");
    htmlInputVanaf = viewChild<ElementRef<HTMLInputElement>>("vanaf");
    htmlInputCars = viewChild<ElementRef<HTMLInputElement>>("cars");

    // constructor() {
    //     super();
    //     effect(() => {
    //         this.htmlInputVanaf()?.nativeElement.select();
    //     });
    // }

    enterPressed(event: KeyboardEvent) {
        this.enterClicked();
    }

    override escapePressed(): void {
        if (this.idxSelected >= 0) {
            this.resetSelection();
            return;
        }
        if (this.entryToAdd.entry.vanaf != 0 || this.entryToAdd.entry.cars != 0 || !this.minimumValid) {
            if (!this.minimumValid) {
                this.resetMinClicked();
            }
            this.resetAddClicked();
            return;
        }
        super.escapePressed();
    }

    deletePressed(event: KeyboardEvent) {
        event.stopPropagation();
        this.deleteClicked();
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

    enterClicked() {
        if (!this.minimumValid) {
            return;
        }
        if (this.idxSelected >= 0 && !this.entryToEdit.carsValid) {
            return;
        }
        switch (this.enterButton.text) {
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
        this.htmlInputVanaf()?.nativeElement.blur();
        this.htmlInputCars()?.nativeElement.blur();
        this.htmlInputMinimum()?.nativeElement.blur();
        this.idxSelected = -1;
        this.enterButton.text = 'Tabel opslaan';
    }

    resetMinClicked() {
        this.inpMinimum = this.tabel.minimum;
        this.minimumValid = true;
        this.enterButton.text = 'Tabel opslaan';
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
            this.enterButton.text = 'Entry wijzigen';
        }
        else {
            this.enterButton.text = 'Tabel opslaan';
        }
        this.entryToEdit = temp;
        this.entryToAdd = new MoyenneEntryToAdd();
    }

    tabelOpslaan() {
        this.tabel.minimum = this.inpMinimum;
        this.tabel.moyennes = this.getOnlyFilledEntries();
        this.bssApi.updateMoyenneTabel(this.tabel)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            resp.data.moyennes.sort(this.compareMoyennes);
            this.aanvullenEntries(resp.data.moyennes);
            this.tabel = resp.data;
            this.inpMinimum = this.tabel.minimum;
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
    }

    resetSelection() {
        this.entryToEdit = new MoyenneEntryToEdit();
        this.idxSelected = -1;
        this.enterButton.text = 'Tabel opslaan';
    }

    verwijderenEntry(idx: number): void {
        this.tabel.moyennes.push(new MoyenneTabelEntry());
        this.tabel.moyennes.splice(idx, 1);
        this.resetSelection();
    }

    validateEntryToAdd() {
        this.enterButton.text = 'Tabel opslaan';
        // validate vanaf
        if (!this.helper.isValidNumber('' + this.entryToAdd.entry.vanaf)) {
            this.entryToAdd.vanafValid = false;
        }
        else {
            this.entryToAdd.vanafValid = !this.tabel.moyennes.some(moy => moy.vanaf == this.entryToAdd.entry.vanaf);
        }
        // validate cars
        this.entryToAdd.carsValid = this.helper.isValidInteger('' + this.entryToAdd.entry.cars) && this.entryToAdd.entry.cars > this.inpMinimum;
        // validate both
        if (!(this.entryToAdd.vanafValid && this.entryToAdd.carsValid)) {
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
            return;
        }
        this.entryToAdd.carsValid = entries.every((entry, i) => {
            if (i === entries.length - 1 || entry.cars < entries[i + 1].cars) {
                return true;
            }
            return false;
        });
        if (this.entryToAdd.vanafValid && this.entryToAdd.carsValid) {
            this.enterButton.text = 'Entry toevoegen';
        }
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
    }

    minimumChanged() {
        this.minimumValid = this.helper.isValidInteger('' + this.inpMinimum);
        if (!this.minimumValid) {
            return;
        }
        const entries = this.getOnlyFilledEntries();
        if (!entries.length) {
            return;
        }
        if (this.inpMinimum >= entries[0].cars) {
            this.minimumValid = false;
            return;
        }
        if (this.entryToAdd.entry.cars > 0) {
            this.entryToAdd.carsValid = this.entryToAdd.entry.cars > this.inpMinimum;
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        console.log(event.target);
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
            this.buttonPressed(event, this.enterButton);
            return false;
        }
        if (event.key === 'Delete') {
            this.buttonPressed(event, this.deleteButton);
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
        const klasse: string | null = this.route.snapshot.paramMap.get('klasse');
        if (!klasse) {
            this.alert.showError('De klasse in de URL is undefined.');
            return;
        }
        this.sectionTitle += ` '${klasse}'`;
        if (this.spelId == '') {
            this.alert.showError('Gekozen spel is leeg. Ga terug naar de Home pagina.');
            return;
        }
        const id = this.spelId + '-' + klasse;
        this.bssApi.getMoyenneTabel(id)
        .then(result => {
            result.moyennes.sort(this.compareMoyennes);
            this.aanvullenEntries(result.moyennes);
            this.tabel = result;
            this.inpMinimum = this.tabel.minimum;
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
}
