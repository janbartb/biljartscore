import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WedTeam } from '../../../model/wedstrijd';

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
    @Input() team: WedTeam = new WedTeam();
    @Output() teamNaamChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    keyupTeamNaam() {
        this.teamNaamChanged.emit(true);
    }
}
