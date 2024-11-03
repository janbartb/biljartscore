import { DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { Component, effect, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, viewChild } from '@angular/core';
import { MoyenneEntryToEdit, MoyenneTabel, MoyenneTabelEntry } from '../../../model/moyenne-tabel';
import { FormsModule } from '@angular/forms';
import { HelperService } from '../../../services/helper.service';

@Component({
    selector: 'app-moyenne-tabel-entries',
    standalone: true,
    imports: [
        SlicePipe,
        DecimalPipe,
        NgClass,
        FormsModule
    ],
    templateUrl: './moyenne-tabel-entries.component.html',
    styleUrl: './moyenne-tabel-entries.component.css'
})
export class MoyenneTabelEntriesComponent implements OnChanges {
    helper = inject(HelperService);

    @Input() tabel: MoyenneTabel = new MoyenneTabel;
    @Input() toEdit: MoyenneEntryToEdit = new MoyenneEntryToEdit();
    @Output() changeSelection: EventEmitter<number> = new EventEmitter<number>();

    htmlInputEditcars = viewChild<ElementRef<HTMLInputElement>>("editcars");

    constructor() {
        effect(() => {
            this.htmlInputEditcars()?.nativeElement.focus();
        });
    }

    entryClicked(idx: number) {
        if (idx != this.toEdit.index) {
            this.changeSelection.emit(idx);
        }
    }

    entryVerwijderenClicked(event: MouseEvent ,idx: number) {
        event.stopPropagation();
        this.tabel.moyennes.push(new MoyenneTabelEntry());
        this.tabel.moyennes.splice(idx, 1);
        this.changeSelection.emit(-1);
    }

    validateEditCars() {
        let result: boolean = true;
        if (!this.helper.isValidInteger('' + this.toEdit.entry.cars)) {
            result = false;
        }
        else {
            const cars = +this.toEdit.entry.cars;
            const minimum = this.toEdit.index == 0 ? this.tabel.minimum : this.tabel.moyennes[this.toEdit.index - 1].cars;
            const maximum = this.toEdit.index == this.getLastEntryIndex() ? 999999 : this.tabel.moyennes[this.toEdit.index + 1].cars;
            if (cars <= minimum || cars >= maximum) {
                result = false;
            }
        }
        this.toEdit.carsValid = result;
    }

    preventDefaults(event: KeyboardEvent) {
        if (event.key == 'Delete') {
            event.preventDefault();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        let selection = changes['toEdit'];
        if (selection && !selection.firstChange) {
            if (selection.currentValue.index >= 0 && selection.currentValue.index != selection.previousValue.index) {
                setTimeout(() => {
                    this.htmlInputEditcars()?.nativeElement.select();                
                }, 100);
            }
            if (selection.currentValue.index >= 0 && selection.previousValue.index >= 0 && selection.previousValue.carsValid) {
                this.tabel.moyennes[selection.previousValue.index].cars = Number(selection.previousValue.entry.cars);
            }
        }
    }

    private getLastEntryIndex(): number {
        return this.tabel.moyennes.filter(e => e.filled).length - 1;
    }

}
