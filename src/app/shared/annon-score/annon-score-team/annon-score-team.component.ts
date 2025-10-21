import { DecimalPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AnnonCat, AnnonTeam } from '../../../model/annonceer';

@Component({
    selector: 'app-annon-score-team',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './annon-score-team.component.html',
    styleUrl: './annon-score-team.component.css'
})
export class AnnonScoreTeamComponent {
    @Input() team: AnnonTeam = new AnnonTeam(0);
    @Input() cats: AnnonCat[] = [];
    @Input() wedklaar: boolean = false;
    @Input() border: string = 'bss-border';
    grijs: boolean = true;
}
