import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-score-speler-laatste',
    standalone: true,
    imports: [],
    templateUrl: './score-speler-laatste.component.html',
    styleUrl: './score-speler-laatste.component.css'
})
export class ScoreSpelerLaatsteComponent {
    @Input() laatste5: number[] = [];
}
