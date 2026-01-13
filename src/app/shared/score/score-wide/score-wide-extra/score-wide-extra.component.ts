import { Component, Input } from '@angular/core';
import { GetalVarComponent } from '../../../getal-var/getal-var.component';

@Component({
    selector: 'app-score-wide-extra',
    standalone: true,
    imports: [
        GetalVarComponent
    ],
    templateUrl: './score-wide-extra.component.html',
    styleUrl: './score-wide-extra.component.css'
})
export class ScoreWideExtraComponent {
    @Input() serie: number = 0;
    @Input() hoogSer: number = 0;
    @Input() punten: number = 0;
    @Input() percView: string = '0,00';
    @Input() formatSer: string = '009';

}
