import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WedTeam } from '../../../../model/wedstrijd';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-wed-score-team',
    standalone: true,
    imports: [
        NgClass,
        DecimalPipe
    ],
    templateUrl: './wed-score-team.component.html',
    styleUrl: './wed-score-team.component.css'
})
export class WedScoreTeamComponent {
    @Input() team: WedTeam = new WedTeam(-1, '');
    @Output() undoBusy: EventEmitter<boolean> = new EventEmitter<boolean>();

    balClicked() {
        this.undoBusy.emit(true);
    }
}
