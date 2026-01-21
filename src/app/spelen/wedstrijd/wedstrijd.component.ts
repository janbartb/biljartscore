import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { HelperService } from '../../services/helper.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SpelerComponent } from '../../shared/wedstrijd/speler/speler.component';
import { TeamComponent } from "../../shared/wedstrijd/team/team.component";
import { Button } from '../../model/button';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { Wedstrijd } from '../../model/wedstrijd';

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

    enterButton: Button = new Button('Enter', 'Naar scorebord', true);
    opnieuwButton: Button = new Button('S', 'Start opnieuw', true);
    nieuwButton: Button = new Button('A', 'Andere wedstrijd', true);

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
            else if (button.key == 'S') {
                this.opnieuwClicked();
            }
            else if (button.key == 'A') {
                this.andereClicked();
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
            this.helper.clearWedstrijdStanden(this.wedstrijd);
            if (this.wedstrijd.teams.length) {
                this.wedstrijd.teams.forEach(team => {
                    team.actief = false;
                    team.spelers.forEach(spl => spl.actief = false);
                });
                this.wedstrijd.teams[0].actief = true;
                this.wedstrijd.teams[0].spelers[0].actief = true;
            }
            else {
                this.wedstrijd.spelers.forEach(spl => spl.actief = false);
                this.wedstrijd.spelers[0].actief = true;
            }
            this.naarScorebord();
        }
    }

    andereClicked() {
        this.router.navigate(['wedstrijd/aantspl']);
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
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter' || event.key == 'PageDown') {
            this.buttonPressed(this.enterButton);
            return false;
        }
        if (!fromInput) {
            if (event.code === 'KeyS' && this.wedGestart) {
                this.buttonPressed(this.opnieuwButton);
                return false;
            }
            if (event.code === 'KeyL' || event.key === '*') {
                this.appData.gotoPage(this.router.url, 'wedstrijd/lijst');
                return false;
            }
            if (event.code === 'KeyA') {
                this.buttonPressed(this.nieuwButton);
                return false;
            }    
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
                this.router.navigate(['wedstrijd/aantspl']);
                return;
            }
            this.wedstrijd = resp.wedstrijd;
            console.log(this.wedstrijd);
            if (!this.helper.areWedstrijdSpelersFilled(this.wedstrijd)) {
                this.router.navigate(['wedstrijd/aantspl']);
                return;
            }
            if (!this.isWedstrijdConfigOk) {
                this.router.navigate(['wedstrijd/config']);
                return;
            }
            console.log(this.wedstrijd);
            this.namesValid = true;
            this.wedGestart = this.isWedstrijdGestart();
            if (!this.wedGestart) {
                if (this.wedstrijd.teams.length) {
                    this.wedstrijd.teams[0].actief = true;
                    this.wedstrijd.teams[0].spelers[0].actief = true;
                }
                else {
                    this.wedstrijd.spelers[0].actief = true;
                }
                this.enterButton.text = 'Start wedstrijd';
            }
            else {
                this.enterButton.text = 'Naar scorebord';
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    // private aanvullenTeamEnSpelerData() {
    //     this.wedstrijd.teams.forEach(team => {
    //         team.teamTsMoy = Math.round(1000 * ((team.spelers[0].splTsMoy + team.spelers[1].splTsMoy) / 2)) / 1000;
    //     });
    //     if (this.wedstrijd.regels.idxOptie == 1) {
    //         this.wedstrijd.teams.forEach(team => {
    //             team.teamTsBrt = 2 * this.wedstrijd.regels.vastAantBrt;
    //             team.spelers.forEach(spl => {
    //                 spl.splTsBrt = this.wedstrijd.regels.vastAantBrt;
    //             });
    //         });
    //         this.wedstrijd.spelers.forEach(spl => {
    //             spl.splTsBrt = this.wedstrijd.regels.vastAantBrt;
    //         });
    //     }
    //     else {
    //         if (this.wedstrijd.regels.idxOptie == 2) {
    //             this.wedstrijd.teams.forEach(team => {
    //                 team.teamTsCar = 2 * this.wedstrijd.regels.vastAantCar;
    //                 team.spelers.forEach(spl => {
    //                     spl.splTsCar = this.wedstrijd.regels.vastAantCar;
    //                 });
    //             });
    //             this.wedstrijd.spelers.forEach(spl => {
    //                 spl.splTsCar = this.wedstrijd.regels.vastAantCar;
    //             });
    //         }
    //         else {
    //             this.wedstrijd.teams.forEach(team => {
    //                 team.spelers.forEach(spl => {
    //                     spl.splTsCar = Math.round(this.wedstrijd.regels.moyAantBrt * spl.splTsMoy);
    //                 });
    //                 team.teamTsCar = team.spelers[0].splTsCar + team.spelers[1].splTsCar;
    //             });
    //             this.wedstrijd.spelers.forEach(spl => {
    //                 spl.splTsCar = Math.round(this.wedstrijd.regels.moyAantBrt * spl.splTsMoy);
    //             });
    //         }
    //     }
    //     if (this.wedstrijd.teams.length) {
    //         this.wedstrijd.teams[0].actief = true;
    //         this.wedstrijd.teams[0].spelers[0].actief = true;
    //     }
    //     else {
    //         this.wedstrijd.spelers[0].actief = true;
    //     }
    // }

    private isWedstrijdGestart(): boolean {
        if (this.wedstrijd.teams.length) {
            return this.wedstrijd.teams[0].spelers[0].stand.aantBrt > 0;
        }
        else {
            return this.wedstrijd.spelers[0].stand.aantBrt > 0;
        }
    }

    private isWedstrijdConfigOk(): boolean {
        if (this.wedstrijd.regels.idxOptie == 0) {
            if (this.wedstrijd.regels.knbbKlasse == '') {
                return false;
            }
            if (this.wedstrijd.telling.idxOptie == 1) {
                return this.isEigenTellingOk();
            }
            return true;
        }
        else if (this.wedstrijd.regels.idxOptie == 1) {
            return this.wedstrijd.regels.vastAantBrt > 0;
        }
        else if (this.wedstrijd.regels.idxOptie == 2) {
            if (this.wedstrijd.regels.vastAantCar <= 0) {
                return false;
            }
            if (this.wedstrijd.telling.idxOptie == 1) {
                return this.isEigenTellingOk();
            }
            return true;
        }
        else {
            if (this.wedstrijd.regels.moyAantBrt <= 0) {
                return false;
            }
            if (this.wedstrijd.telling.idxOptie == 1) {
                return this.isEigenTellingOk();
            }
            return true;
        }
    }

    private isEigenTellingOk(): boolean {
        return this.wedstrijd.telling.winstPunten >= 0 &&
               this.wedstrijd.telling.gelijkPunten >= 0 &&
               this.wedstrijd.telling.bovenMoyPunten >= 0;
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
