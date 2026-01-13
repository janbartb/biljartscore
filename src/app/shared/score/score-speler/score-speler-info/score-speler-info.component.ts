import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ScoreSpelerInfoBalComponent } from "./score-speler-info-bal/score-speler-info-bal.component";

@Component({
    selector: 'app-score-speler-info',
    standalone: true,
    imports: [
        DecimalPipe,
        ScoreSpelerInfoBalComponent
    ],
    templateUrl: './score-speler-info.component.html',
    styleUrl: './score-speler-info.component.css'
})
export class ScoreSpelerInfoComponent {
    @Input() naam: string = '';
    @Input() moyenne: number = 0;
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;
    @Input() position: string = 'left';

}
