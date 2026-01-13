import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-score-wide-info',
    standalone: true,
    imports: [
        DecimalPipe
    ],
    templateUrl: './score-wide-info.component.html',
    styleUrl: './score-wide-info.component.css'
})
export class ScoreWideInfoComponent {
    @Input() naam: string = '';
    @Input() moyenne: number = 0;
    @Input() position: string = 'left';

}
