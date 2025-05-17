import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-score-speler-speler',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './score-speler-speler.component.html',
    styleUrl: './score-speler-speler.component.css'
})
export class ScoreSpelerSpelerComponent {
    @Input() actief: boolean = false;
    @Input() wit: boolean = false;
    @Input() naam: string = '';
    @Input() moy: number = 0;
    @Input() cars: number = 0;
    
}
