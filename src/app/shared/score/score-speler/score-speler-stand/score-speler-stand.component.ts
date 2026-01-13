import { Component, Input } from '@angular/core';
import { GetalVarComponent } from '../../../getal-var/getal-var.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-score-speler-stand',
    standalone: true,
    imports: [
        GetalVarComponent,
        NgClass
    ],
    templateUrl: './score-speler-stand.component.html',
    styleUrl: './score-speler-stand.component.css'
})
export class ScoreSpelerStandComponent {
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;
    @Input() serie: number = 0;
    @Input() enNog: number = 0;
    @Input() moyView: string = '0,000';
    @Input() numFormats: string[] = ['009', '009', '009'];
    @Input() position: string = 'left';

}
