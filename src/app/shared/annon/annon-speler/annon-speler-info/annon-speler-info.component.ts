import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-annon-speler-info',
    standalone: true,
    imports: [
        DecimalPipe
    ],
    templateUrl: './annon-speler-info.component.html',
    styleUrl: './annon-speler-info.component.css'
})
export class AnnonSpelerInfoComponent {
    @Input() naam: string = '';
    @Input() moyenne: number = 0;
    @Input() actief: boolean = false;
}
