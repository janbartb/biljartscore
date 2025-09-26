import { Component, HostListener, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { Annonceer, AnnonSpeler, AnnonSpelerStand, AnnonTeam } from '../../model/annonceer';
import { Button } from '../../model/button';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { ButtonComponent } from '../../shared/button-group/button/button.component';

@Component({
    selector: 'app-annon',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ButtonComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './annon.component.html',
    styleUrl: './annon.component.css'
})
export class AnnonComponent extends BaseComponent implements OnInit {
    subtitle: string = '';
    annon: Annonceer = new Annonceer();
    annonOrig: Annonceer = new Annonceer();
    wedGestart: boolean = false;
    columns: number[] = [];
    colWidth: number = 0;

    enterButton: Button = new Button('Enter', 'Naar scorebord', true);
    opnieuwButton: Button = new Button('S', 'Start opnieuw', true);
    nieuwButton: Button = new Button('A', 'Andere wedstrijd', true);

    override escapePressed(): void {
        this.router.navigate(['annon/spelers']);
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
        this.naarScorebord();
    }

    opnieuwClicked() {
        if (this.annonOrig.config.aantSpelers == 5) {
            this.annonOrig.teams.forEach(team => {
                team.actief = false;
                team.stand = new AnnonSpelerStand(this.annonOrig.config.cats.length);
                team.spelers.forEach(spl => {
                    spl.actief = false;
                    spl.stand = new AnnonSpelerStand(this.annonOrig.config.cats.length);
                });
            });
            this.annonOrig.teams[0].actief = true;
            this.annonOrig.teams[0].spelers[0].actief = true;
        }
        else {
            this.annonOrig.spelers.forEach(spl => {
                spl.actief = false;
                spl.stand = new AnnonSpelerStand(this.annonOrig.config.cats.length);
            });
            this.annonOrig.spelers[0].actief = true;
        }
        this.annonOrig.wedGespeeld = false;
        this.naarScorebord();
    }

    andereClicked() {
        this.router.navigate(['annon/aantspl']);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event);
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter' || event.key == 'PageDown') {
            this.buttonPressed(this.enterButton);
            return false;
        }
        if (event.code === 'KeyS' && this.wedGestart) {
            this.buttonPressed(this.opnieuwButton);
            return false;
        }
        if (event.code === 'KeyA') {
            this.buttonPressed(this.nieuwButton);
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
        this.bssApi.getAnnonWedstrijd()
        .then(resp => {
            if (!resp.gevonden) {
                this.router.navigate(['annon/aantspl']);
                return;
            }
            this.annonOrig = resp.annon;
            if (this.annonOrig.config.aantSpelers == 0) {
                this.router.navigate(['annon/aantspl']);
                return;
            }
            this.subtitle = this.annonOrig.config.isAnnonceer ? 'Annonceren' : 'Pentathlon';
            this.setAnnon();
            let idxSpl = -1;
            this.columns.push(idxSpl);
            this.annon.spelers.forEach(() => {
                idxSpl++;
                this.columns.push(idxSpl);
            });
            this.colWidth = 60 / this.columns.length;
            this.wedGestart = this.annon.spelers[0].stand.aantBrt > 0;
            if (this.wedGestart) {
                this.enterButton.text = 'Naar scorebord';
            }
            else {
                if (this.annonOrig.config.aantSpelers == 5) {
                    this.annonOrig.teams[0].actief = true;
                    this.annonOrig.teams[0].spelers[0].actief = true;
                }
                else {
                    this.annonOrig.spelers[0].actief = true;
                }
                this.enterButton.text = 'Start wedstrijd';
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });        
    }

    private setAnnon() {
        this.annon = JSON.parse(JSON.stringify(this.annonOrig));
        if (this.annon.config.aantSpelers == 5) {
            this.annon.teams.forEach(tm => {
                this.annon.spelers.push(this.maakSpelerVanTeam(tm));
            });
        }
    }

    private maakSpelerVanTeam(team: AnnonTeam): AnnonSpeler {
        let spl = new AnnonSpeler(this.annon.config.cats.length);
        spl.splBordNaam = `${team.spelers[0].splBordNaam} - ${team.spelers[1].splBordNaam}`;
        spl.splTsCar = team.teamTsCar;
        spl.splTsCarArr = team.teamTsCarArr;
        spl.splTsMoy = team.teamTsMoy;
        spl.stand = team.stand;
        return spl;
    }

    private naarScorebord() {
        this.bssApi.saveAnnonWedstrijd(this.annonOrig)
        .then(resp => {
            this.router.navigate(['annon/score']);
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

}
