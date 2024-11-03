import { Component, Input, OnInit } from '@angular/core';
import { Team } from '../../../../model/vereniging';
import { SpelerWrapper } from '../../../../model/speler';

@Component({
  selector: 'app-vereniging-teams',
  standalone: true,
  imports: [],
  templateUrl: './vereniging-teams.component.html',
  styleUrl: './vereniging-teams.component.css'
})
export class VerenigingTeamsComponent implements OnInit {
    @Input() teams: Team[] = [];
    @Input() leden: SpelerWrapper[] = [];
    @Input() teamsMode: string = 'view';
    @Input() teamMode: string = 'edit';

    ngOnInit(): void {
        
    }
}
