import { Component, Input } from '@angular/core';
import { GetalVarComponent } from '../../../getal-var/getal-var.component';

@Component({
    selector: 'app-annon-speler-extra',
    standalone: true,
    imports: [
        GetalVarComponent
    ],
    templateUrl: './annon-speler-extra.component.html',
    styleUrl: './annon-speler-extra.component.css'
})
export class AnnonSpelerExtraComponent {
    @Input() beurten: number = 0;
    @Input() punten: number = 0;
}
