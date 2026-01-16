import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GetalVarComponent } from '../../../getal-var/getal-var.component';

@Component({
    selector: 'app-annon-wide-extra',
    standalone: true,
    imports: [
        GetalVarComponent,
        NgClass
    ],
    templateUrl: './annon-wide-extra.component.html',
    styleUrl: './annon-wide-extra.component.css'
})
export class AnnonWideExtraComponent {
    @Input() actief: boolean = false;
    @Input() beurten: number = 0;
    @Input() punten: number = 0;
}
