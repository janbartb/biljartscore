import { Component, HostListener, OnInit } from '@angular/core';
import { Match, TeamMatch } from '../../../model/match';
import { BaseComponent } from '../../../base/base.component';
import { KnbbTeamMatchLijstWedstrijdComponent } from './knbb-team-match-lijst-wedstrijd/knbb-team-match-lijst-wedstrijd.component';

@Component({
    selector: 'app-knbb-team-match-lijst',
    standalone: true,
    imports: [
        KnbbTeamMatchLijstWedstrijdComponent
    ],
    templateUrl: './knbb-team-match-lijst.component.html',
    styleUrl: './knbb-team-match-lijst.component.css'
})
export class KnbbTeamMatchLijstComponent extends BaseComponent implements OnInit {
    match: TeamMatch = new TeamMatch();
    matchRead: boolean = false;

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Escape' || event.key === 'Backspace') {
            event.stopPropagation();
            this.escapePressed();
            return false;
        }
        return false;
    }

    ngOnInit(): void {
        this.bssApi.getKnbbTeamMatch()
        .then(resp => {
            if (resp.gevonden) {
                this.match = resp.match;
                this.matchRead = true;
            }
            else {
                console.log('Scorelijst : bestand teammatch.json niet gevonden - terug naar match pagina.');
                this.router.navigate(['teammatch']);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }
}
