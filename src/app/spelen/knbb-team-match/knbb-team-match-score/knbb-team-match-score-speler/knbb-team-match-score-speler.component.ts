import { DecimalPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchSpeler } from '../../../../model/match';

@Component({
    selector: 'app-knbb-team-match-score-speler',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './knbb-team-match-score-speler.component.html',
    styleUrl: './knbb-team-match-score-speler.component.css'
})
export class KnbbTeamMatchScoreSpelerComponent {
    @Input() speler: MatchSpeler = new MatchSpeler();
    @Input() teamIdx: number = 0;
    @Input() oldPunten: number = 0;
    @Output() undoBusy: EventEmitter<boolean> = new EventEmitter<boolean>();

    balClicked() {
        this.undoBusy.emit(true);
    }
}
