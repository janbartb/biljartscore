import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GetalVarComponent } from '../../../getal-var/getal-var.component';

@Component({
    selector: 'app-score-wide-stand',
    standalone: true,
    imports: [
        GetalVarComponent,
        NgClass
    ],
    templateUrl: './score-wide-stand.component.html',
    styleUrl: './score-wide-stand.component.css'
})
export class ScoreWideStandComponent {
    @Input() aantCar: number = 0;
    @Input() aantBrt: number = 0;
    @Input() serie: number = 0;
    @Input() enNog: number = 0;
    @Input() moyView: string = '0,000';
    @Input() numFormats: string[] = ['009', '009', '009'];
    @Input() position: string = 'left';

}
