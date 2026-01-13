import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-score-wide-voortgang',
    standalone: true,
    imports: [],
    templateUrl: './score-wide-voortgang.component.html',
    styleUrl: './score-wide-voortgang.component.css'
})
export class ScoreWideVoortgangComponent {
    @Input() aantCar: number = 0;
    @Input() serie: number = 0;
    @Input() voortgang: number = 0;

}
