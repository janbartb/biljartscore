import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WedTeam } from '../../../model/wedstrijd';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-team',
    standalone: true,
    imports: [
        FormsModule,
        DecimalPipe
    ],
    templateUrl: './team.component.html',
    styleUrl: './team.component.css'
})
export class TeamComponent {
    @Input() team: WedTeam = new WedTeam(0, '');
    @Output() teamNaamChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    keyupTeamNaam() {
        this.teamNaamChanged.emit(true);
    }
}
