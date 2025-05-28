import { Component, Input } from '@angular/core';
import { AnnonCat, AnnonSpeler } from '../../../model/annonceer';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-annon-score-speler',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './annon-score-speler.component.html',
    styleUrl: './annon-score-speler.component.css'
})
export class AnnonScoreSpelerComponent {
    @Input() speler: AnnonSpeler = new AnnonSpeler(0);
    @Input() cats: AnnonCat[] = [];
    grijs: boolean = true;
}
