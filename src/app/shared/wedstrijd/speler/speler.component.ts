import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { WedSpeler } from '../../../model/wedstrijd';

@Component({
    selector: 'app-speler',
    standalone: true,
    imports: [
        FormsModule,
        DecimalPipe
    ],
    templateUrl: './speler.component.html',
    styleUrl: './speler.component.css'
})
export class SpelerComponent {
    @Input() speler: WedSpeler = new WedSpeler();
    @Output() bordNaamChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    keyupBordNaam() {
        this.bordNaamChanged.emit(true);
    }
}
