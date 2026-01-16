import { Component, Input } from '@angular/core';
import { Annonceer } from '../../../model/annonceer';
import { AnnonWedSpel2Component } from '../annon-wed-spel2/annon-wed-spel2.component';
import { AnnonTeamComponent } from '../annon-team/annon-team.component';

@Component({
    selector: 'app-annon-wed-team2',
    standalone: true,
    imports: [
        AnnonTeamComponent,
        AnnonWedSpel2Component
    ],
    templateUrl: './annon-wed-team2.component.html',
    styleUrl: './annon-wed-team2.component.css'
})
export class AnnonWedTeam2Component {
    @Input() wedstrijd: Annonceer = new Annonceer();
}
