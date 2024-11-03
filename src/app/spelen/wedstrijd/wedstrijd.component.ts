import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { Wedstrijd } from '../../model/wedstrijd';
import { HelperService } from '../../services/helper.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SpelerComponent } from '../../shared/wedstrijd/speler/speler.component';
import { TeamComponent } from "../../shared/wedstrijd/team/team.component";
import { Button } from '../../model/button';
import { ButtonComponent } from '../../shared/button-group/button/button.component';

@Component({
    selector: 'app-wedstrijd',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SpelerComponent,
        TeamComponent,
        ButtonComponent
    ],
    templateUrl: './wedstrijd.component.html',
    styleUrl: './wedstrijd.component.css'
})
export class WedstrijdComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    wedstrijd: Wedstrijd = new Wedstrijd();
    namesValid: boolean = true;
    wedGestart: boolean = false;

    enterButton: Button = new Button('Enter', 'Start wedstrijd', true);
    opnieuwButton: Button = new Button('Del', 'Opnieuw beginnen', true);

    override escapePressed(): void {
        this.router.navigate(['wedstrijd/config']);
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.enterClicked();
            }
            if (button.key == 'Del') {
                this.opnieuwClicked();
            }
        }, 300);
    }

    enterClicked() {
        if (this.namesValid) {
            this.naarScorebord();
        }
    }

    opnieuwClicked() {
        if (this.namesValid) {
            this.helper.clearWedstrijdResultaten(this.wedstrijd);
            if (this.wedstrijd.teams.length) {
                this.wedstrijd.teams.forEach(team => {
                    team.active = false;
                    team.spelers.forEach(spl => spl.active = false);
                });
                this.wedstrijd.teams[0].active = true;
                this.wedstrijd.teams[0].spelers[0].active = true;
            }
            else {
                this.wedstrijd.spelers.forEach(spl => spl.active = false);
                this.wedstrijd.spelers[0].active = true;
            }
            this.naarScorebord();
        }
    }

    teamNaamChanged() {
        this.namesValid = false;
        if (this.wedstrijd.teams[0].teamNaam.trim() == '') {
            return;
        }
        if (this.wedstrijd.teams[1].teamNaam.trim() == '') {
            return;
        }
        if (this.wedstrijd.teams[0].teamNaam.trim() == this.wedstrijd.teams[1].teamNaam.trim()) {
            return;
        }
        this.namesValid = true;
    }

    bordNaamChanged() {
        this.namesValid = false;
        let names: string[] = [];
        if (this.wedstrijd.teams.length) {
            const namesFilled = this.wedstrijd.teams.every(team => {
                return team.spelers.every(spl => {
                    names.push(spl.splBordNaam);
                    return spl.splBordNaam.trim() != '';
                });
            });
            if (!namesFilled) {
                return;
            }
            if (!this.helper.hasUniqueValues(names)) {
                return;
            }
            this.namesValid = true;
        }
        else {
            const namesFilled = this.wedstrijd.spelers.every(spl => {
                names.push(spl.splBordNaam);
                return spl.splBordNaam.trim() != '';
            });
            if (!namesFilled) {
                return;
            }
            if (!this.helper.hasUniqueValues(names)) {
                return;
            }
            this.namesValid = true;
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event);
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.enterButton);
            return false;
        }
        if (event.key === 'Delete' && this.wedGestart) {
            this.buttonPressed(this.opnieuwButton);
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.bssApi.getWedstrijd()
        .then(resp => {
            if (!resp.gevonden) {
                this.router.navigate(['wedstrijd/spelers']);
                return;
            }
            this.wedstrijd = resp.wedstrijd;
            if (!this.helper.areWedstrijdSpelersFilled(this.wedstrijd)) {
                this.router.navigate(['wedstrijd/spelers']);
                return;
            }
            if (!this.isWedstrijdConfigOk) {
                this.router.navigate(['wedstrijd/config']);
                return;
            }
            console.log(this.wedstrijd);
            this.wedGestart = this.isWedstrijdGestart();
            if (!this.wedGestart) {
                this.aanvullenTeamEnSpelerData();
                this.enterButton.text = 'Start wedstrijd';
            }
            else {
                this.enterButton.text = 'Doorgaan met wedstrijd';
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private aanvullenTeamEnSpelerData() {
        this.wedstrijd.teams.forEach(team => {
            team.teamTsGem = Math.round(1000 * ((team.spelers[0].splTsGem + team.spelers[1].splTsGem) / 2)) / 1000;
        });
        if (this.wedstrijd.isVastAantBrt) {
            this.wedstrijd.teams.forEach(team => {
                team.teamTsBrt = 2 * this.wedstrijd.tsBeurten;
                team.spelers.forEach(spl => {
                    spl.splTsBrt = this.wedstrijd.tsBeurten;
                });
            });
            this.wedstrijd.spelers.forEach(spl => {
                spl.splTsBrt = this.wedstrijd.tsBeurten;
            });
        }
        else {
            if (this.wedstrijd.isVastAantCar) {
                this.wedstrijd.teams.forEach(team => {
                    team.teamTsCar = 2 * this.wedstrijd.tsCaramboles;
                    team.spelers.forEach(spl => {
                        spl.splTsCar = this.wedstrijd.tsCaramboles;
                    });
                });
                this.wedstrijd.spelers.forEach(spl => {
                    spl.splTsCar = this.wedstrijd.tsCaramboles;
                });
            }
            else {
                this.wedstrijd.teams.forEach(team => {
                    team.spelers.forEach(spl => {
                        spl.splTsCar = Math.round(this.wedstrijd.tsBeurten * spl.splTsGem);
                    });
                    team.teamTsCar = team.spelers[0].splTsCar + team.spelers[1].splTsCar;
                });
                this.wedstrijd.spelers.forEach(spl => {
                    spl.splTsCar = Math.round(this.wedstrijd.tsBeurten * spl.splTsGem);
                });
            }
        }
        if (this.wedstrijd.teams.length) {
            this.wedstrijd.teams[0].active = true;
            this.wedstrijd.teams[0].spelers[0].active = true;
        }
        else {
            this.wedstrijd.spelers[0].active = true;
        }
    }

    private isWedstrijdGestart(): boolean {
        if (this.wedstrijd.teams.length) {
            return this.wedstrijd.teams[0].spelers[0].stand.aantBrt > 0;
        }
        else {
            return this.wedstrijd.spelers[0].stand.aantBrt > 0;
        }
    }

    private isWedstrijdConfigOk(): boolean {
        if (this.wedstrijd.isVastAantBrt) {
            return this.wedstrijd.tsBeurten > 0;
        }
        else {
            if (this.wedstrijd.isVastAantCar) {
                return this.wedstrijd.tsCaramboles > 0;
            }
            else {
                return this.wedstrijd.tsBeurten > 0;
            }
        }
    }

    private naarScorebord() {
        this.bssApi.saveWedstrijd(this.wedstrijd)
        .then(resp => {
            this.router.navigate(['wedstrijd/score']);
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }
}
