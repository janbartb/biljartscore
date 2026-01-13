import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-score-speler-info-bal',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './score-speler-info-bal.component.html',
    styleUrl: './score-speler-info-bal.component.css'
})
export class ScoreSpelerInfoBalComponent {
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;

}
