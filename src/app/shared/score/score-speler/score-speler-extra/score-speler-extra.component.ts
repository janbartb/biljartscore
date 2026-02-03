import { Component, Input } from '@angular/core';
import { GetalVarComponent } from '../../../getal-var/getal-var.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-score-speler-extra',
    standalone: true,
    imports: [
        GetalVarComponent,
        NgClass
    ],
    templateUrl: './score-speler-extra.component.html',
    styleUrl: './score-speler-extra.component.css'
})
export class ScoreSpelerExtraComponent {
    @Input() serie: number = 0;
    @Input() hoogSer: number = 0;
    @Input() punten: number = 0;
    @Input() oldPunten: number = 0;
    @Input() perc: number = 0;
    @Input() percView: string = '0,00';
    @Input() formatSer: string = '009';
    @Input() position: string = 'left';

}
