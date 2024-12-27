import { Component, Input, OnInit } from '@angular/core';
import { Match, MatchSpeler } from '../../../model/match';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-knbb-match-speler',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './knbb-match-speler.component.html',
    styleUrl: './knbb-match-speler.component.css'
})
export class KnbbMatchSpelerComponent implements OnInit {
    @Input() match: Match = new Match();
    @Input() idx: number = 0;
    @Input() status: number = 0;
    speler: MatchSpeler = new MatchSpeler();
    teg: MatchSpeler = new MatchSpeler();

    ngOnInit(): void {
        this.speler = this.match.spelers[this.idx];
        this.teg = this.match.spelers[this.idx == 0 ? 1 : 0];
    }
}
