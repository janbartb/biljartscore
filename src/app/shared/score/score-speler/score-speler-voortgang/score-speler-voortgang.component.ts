import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-score-speler-voortgang',
    standalone: true,
    imports: [
        DecimalPipe
    ],
    templateUrl: './score-speler-voortgang.component.html',
    styleUrl: './score-speler-voortgang.component.css'
})
export class ScoreSpelerVoortgangComponent {
    @Input() aantCar: number = 0;
    @Input() serie: number = 0;
    @Input() voortgang: number = 0;
    @Input() teamAantCar: number = 0;
    @Input() teamTsCar: number = 0;
    @Input() teamMaxCar: number = 0;
    @Input() position: string = 'left';
}
