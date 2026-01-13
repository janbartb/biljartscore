import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-score-wide-bal',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './score-wide-bal.component.html',
    styleUrl: './score-wide-bal.component.css'
})
export class ScoreWideBalComponent {
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;

}
