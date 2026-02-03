import { Component, Input } from '@angular/core';
import { GetalVarComponent } from '../../../getal-var/getal-var.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-score-wide-laatste5',
    standalone: true,
    imports: [
        GetalVarComponent,
        NgClass
    ],
    templateUrl: './score-wide-laatste5.component.html',
    styleUrl: './score-wide-laatste5.component.css'
})
export class ScoreWideLaatste5Component {
    @Input() actief: boolean = false;
    @Input() serView: string = '0';
    @Input() formatSer: string = '009';
    @Input() laatste5: number[] = [];
    @Input() isVijfde: boolean = false;
    @Input() aantCar: number = 0;
    @Input() metWit: boolean = true;
    @Input() position: string = 'left';

}
