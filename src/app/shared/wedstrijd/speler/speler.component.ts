import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OefWedSpeler } from '../../../model/oef-wedstrijd';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

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
    @Input() speler: OefWedSpeler = new OefWedSpeler(0);
    @Output() bordNaamChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    keyupBordNaam() {
        this.bordNaamChanged.emit(true);
    }
}
