import { Component, Input } from '@angular/core';
import { MatchSpeler } from '../../../model/match';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-knbb-team-match-speler',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './knbb-team-match-speler.component.html',
    styleUrl: './knbb-team-match-speler.component.css'
})
export class KnbbTeamMatchSpelerComponent {
    @Input() spl: MatchSpeler = new MatchSpeler();
    @Input() teg: MatchSpeler = new MatchSpeler();
    @Input() status: number = 0;
}
