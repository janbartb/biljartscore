import { Component, Input } from '@angular/core';
import { AnnonCat, AnnonSpeler } from '../../../model/annonceer';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-annon-score-speler-landscape',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './annon-score-speler-landscape.component.html',
    styleUrl: './annon-score-speler-landscape.component.css'
})
export class AnnonScoreSpelerLandscapeComponent {
    @Input() speler: AnnonSpeler = new AnnonSpeler(0);
    @Input() cats: AnnonCat[] = [];
    @Input() wedklaar: boolean = false;
    @Input() border = 'bss-border'; 
    grijs: boolean = true;
}
