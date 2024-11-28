import { Component, Input } from '@angular/core';
import { ScoreBeurt } from '../../../../model/score-beurt';
import { NgClass, SlicePipe } from '@angular/common';

@Component({
    selector: 'app-knbb-team-match-lijst-speler',
    standalone: true,
    imports: [
        SlicePipe,
        NgClass
    ],
    templateUrl: './knbb-team-match-lijst-speler.component.html',
    styleUrl: './knbb-team-match-lijst-speler.component.css'
})
export class KnbbTeamMatchLijstSpelerComponent {
    @Input() lijst: ScoreBeurt[] = [];

}
