import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { WedSpeler, WedSpelerStand, Wedstrijd, WedTeam } from '../../../model/wedstrijd';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { List } from '../../../model/list';
import { NgClass } from '@angular/common';
import { Button } from '../../../model/button';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { SpelerWrapper } from '../../../model/speler';
import { VerenigingKort } from '../../../model/vereniging';
import { HelperService } from '../../../services/helper.service';

@Component({
    selector: 'app-wed-spelers',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './wed-spelers.component.html',
    styleUrl: './wed-spelers.component.css'
})
export class WedSpelersComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    activeSection: number = 0;
    verenigingLijst: List<VerenigingKort> = new List<VerenigingKort>();
    spelerLijst: List<SpelerWrapper> = new List<SpelerWrapper>();
    verenigingFilter: string = this.appData.getConfig()?.vereniging || '';
    wedOrig: Wedstrijd = new Wedstrijd();
    wedstrijd: Wedstrijd = new Wedstrijd();
    aantalLijst: List<string> = new List<string>();

    idxActiveTeam: number = -1;
    idxActiveSpeler: number = -1;

    spelersFilled: boolean = false;
    wedstrijdChanged: boolean = false;

    enterButton: Button = new Button('Ctrl+Enter', 'Ga verder', true);
    resetButton: Button = new Button('Backspace', 'Reset', true);
    enterSelectButton: Button = new Button('Enter', 'Selecteer', true);

    override escapePressed(): void {
        if (this.activeSection == 0) {
            this.router.navigate(['spelkeuze']);
        }
        this.activeSection--;
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.enterSelectClicked();
            }
            else if (button.key == 'Backspace') {
                this.resetClicked();
            }
            else if (button.key == 'Ctrl+Enter') {
                this.gaVerderClicked();
            }
        }, 300);
    }

    enterSelectClicked() {
        if (this.activeSection == 0) {
            this.aantalClicked(this.aantalLijst.hoveredIdx);
        }
        else if (this.activeSection == 1) {
            this.verenigingClicked(this.verenigingLijst.hoveredIdx);
        }
        else if (this.activeSection == 2) {
            this.spelerClicked(this.spelerLijst.hoveredIdx);
        }
    }

    aantalClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.activeSection = 0;
        this.aantalLijst.selectedIdx = this.aantalLijst.hoveredIdx = idx;
        if (this.wedstrijd.aantSpelers != idx + 1) {
            this.wedstrijd.aantSpelers = idx + 1;
            this.initSpelers();
            this.setWedstrijdChanged();
        }
        this.activeSection++;
    }

    verenigingClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.activeSection = 1;
        this.verenigingLijst.selectedIdx = this.verenigingLijst.hoveredIdx = idx;
        const vereniging: VerenigingKort = this.verenigingLijst.filtered[idx];
        this.verenigingFilter = vereniging.verId;
        this.spelerLijst.clearSelection();
        this.filterSpelerLijst();
        if (this.spelerLijst.filtered.length > 0) {
            this.activeSection++;
        }
    }

    spelerClicked(idx: number) {
        if (idx < 0 || this.aantalLijst.selectedIdx < 0) {
            return;
        }
        this.activeSection = 2;
        this.spelerLijst.selectedIdx = this.spelerLijst.hoveredIdx = idx;
        this.addSpelerToWedstrijd(this.spelerLijst.filtered[idx]);
    }

    resetClicked() {
        this.activeSection = 0;
        this.verenigingFilter = this.appData.getConfig()?.vereniging || '';
        this.verenigingLijst.selectedIdx = this.verenigingLijst.hoveredIdx = this.verenigingLijst.filtered.findIndex(v => v.verId == this.verenigingFilter);
        this.filterSpelerLijst();
        this.spelerLijst.selectedIdx = this.spelerLijst.hoveredIdx = -1;
        this.wedstrijd = this.copyWedstrijd();
        this.aantalLijst.selectedIdx = this.aantalLijst.hoveredIdx = this.wedstrijd.aantSpelers == 0 ? -1 : this.wedstrijd.aantSpelers - 1;
        if (this.aantalLijst.selectedIdx >= 0) {
            if (this.wedstrijd.teams.length > 0) {
                this.idxActiveTeam = 0;
            }
            this.idxActiveSpeler = 0;
        }
        this.setSpelersFilled();
        this.wedstrijdChanged = false;
    }

    gaVerderClicked() {
        if (!this.spelersFilled) {
            return;
        }
        console.log(this.wedstrijd);
        if (this.wedstrijdChanged) {
            this.wedstrijd.wedOver = false;
            this.helper.clearWedstrijdResultaten(this.wedstrijd);
        }
        this.bssApi.saveWedstrijd(this.wedstrijd)
        .then(resp => {
            const gotoUrl = this.router.url.replace('spelers', 'config');
            this.router.navigate([gotoUrl]);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    maakSpelerActief(idxSpl: number, idxTeam?: number) {
        this.idxActiveSpeler = idxSpl;
        if (idxTeam != undefined) {
            this.idxActiveTeam = idxTeam;
        }
    }

    maakSectionActief(idx: number) {
        this.activeSection = idx;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event);
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowLeft' || event.key ==='ArrowRight') {
            this.veranderActieveSectie(event.key ==='ArrowLeft' ? -1 : 1)
            return false;
        }
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                if (this.activeSection == 0) {
                    this.aantalLijst.hoverPreviousItem();
                }
                else if (this.activeSection == 1) {
                    this.verenigingLijst.hoverPreviousItem();
                }
                else if (this.activeSection == 2) {
                    this.spelerLijst.hoverPreviousItem();
                }
                else if (this.activeSection == 3 || event.ctrlKey) {
                    this.maakVorigeSpelerActief();
                }
                return false;
            }
            if (event.key === 'ArrowDown') {
                if (this.activeSection == 0) {
                    this.aantalLijst.hoverNextItem();
                }
                else if (this.activeSection == 1) {
                    this.verenigingLijst.hoverNextItem();
                }
                else if (this.activeSection == 2) {
                    this.spelerLijst.hoverNextItem();
                }
                else if (this.activeSection == 3 || event.ctrlKey) {
                    this.maakVolgendeSpelerActief();
                }
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.buttonPressed(this.enterButton);
                return false;
            }
            if (this.activeSection < 3) {
                this.buttonPressed(this.enterSelectButton);
                return false;
            }
            return true;
        }
        if (event.key === 'Backspace') {
            this.buttonPressed(this.resetButton);
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
        this.fillAantalLijst();
        Promise.all([
            this.bssApi.getVerenigingenKort(),
            this.bssApi.getSpelersLijst(this.spelId),
            this.bssApi.getWedstrijd()
        ])
        .then(results => {
            let verenigingen = results[0];
            verenigingen.unshift({
                verId: '',
                naam: 'Geen',
                korteNaam: 'Geen',
                inTeam: false
            });
            this.verenigingLijst.fillItems(verenigingen);
            this.verenigingLijst.selectedIdx = this.verenigingLijst.filtered.findIndex(v => v.verId == this.verenigingFilter);
            this.spelerLijst.fillItems(results[1]);
            this.filterSpelerLijst();
            if (results[2].gevonden) {
                this.wedOrig = results[2].wedstrijd;
            }
            this.resetClicked();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private veranderActieveSectie(direction: number) {
        let idx = this.activeSection;
        idx += direction;
        if (idx < 0) {
            idx = 3;
        }
        if (idx > 3) {
            idx = 0;
        }
        this.maakSectionActief(idx);
    }

    private addSpelerToWedstrijd(spelerToAdd: SpelerWrapper) {
        let origSpeler: WedSpeler = this.getOrigWedSpeler(this.idxActiveSpeler, this.idxActiveTeam);
        let speler: WedSpeler = this.getWedstrijdSpeler(this.idxActiveSpeler, this.idxActiveTeam);
        if (speler && speler.splId == spelerToAdd.speler.id) {
            this.maakVolgendeSpelerActief();
            return;
        }
        speler.splId = spelerToAdd.speler.id;
        speler.splNaam = spelerToAdd.getNaam();
        speler.splBordNaam = spelerToAdd.speler.vnaam;
        speler.splSpreekNaam = (spelerToAdd.speler.spreeknaam != '') ? spelerToAdd.speler.spreeknaam : speler.splBordNaam;
        speler.splTsGem = spelerToAdd.getGemiddeldeVanSpel();
        speler.stand = new WedSpelerStand();
        this.setWedstrijdChanged();
        this.maakVolgendeSpelerActief();
        this.setSpelersFilled();
    }

    private getWedstrijdSpeler(idxSpl: number, idxTeam: number): WedSpeler {
        if (idxTeam >= 0) {
            return this.wedstrijd.teams[idxTeam].spelers[idxSpl];
        }
        return this.wedstrijd.spelers[idxSpl];
    }

    private getOrigWedSpeler(idxSpl: number, idxTeam: number): WedSpeler {
        if (idxTeam >= 0) {
            return this.wedOrig.teams[idxTeam]?.spelers[idxSpl];
        }
        return this.wedOrig.spelers[idxSpl];
    }

    private maakVorigeSpelerActief() {
        if (this.wedstrijd.aantSpelers == 0) {
            return;
        }
        let idxSpl = this.idxActiveSpeler;
        let idxTeam = this.idxActiveTeam;
        if (this.wedstrijd.aantSpelers == 5) {
            if (idxSpl == 1) {
                idxSpl--;
            }
            else {
                if (idxTeam == 1) {
                    idxTeam--;
                    idxSpl = 1;
                }
                else {
                    idxTeam = 1;
                    idxSpl = 1;
                }
            }
            this.maakSpelerActief(idxSpl, idxTeam);
        }
        else {
            idxSpl--;
            if (idxSpl < 0) {
                idxSpl = this.wedstrijd.aantSpelers - 1;
            }
            this.maakSpelerActief(idxSpl);
        }
    }

    private maakVolgendeSpelerActief() {
        if (this.wedstrijd.aantSpelers == 0) {
            return;
        }
        let idxSpl = this.idxActiveSpeler;
        let idxTeam = this.idxActiveTeam;
        if (this.wedstrijd.aantSpelers == 5) {
            if (idxSpl == 0) {
                idxSpl++;
            }
            else {
                if (idxTeam == 0) {
                    idxTeam++;
                    idxSpl = 0;
                }
                else {
                    console.log('jaja')
                    idxTeam = 0;
                    idxSpl = 0;
                }
            }
            this.maakSpelerActief(idxSpl, idxTeam);
        }
        else {
            idxSpl++;
            if (idxSpl >= this.wedstrijd.aantSpelers) {
                idxSpl = 0;
            }
            this.maakSpelerActief(idxSpl);
        }
    }

    private initSpelers() {
        this.idxActiveTeam = -1;
        this.idxActiveSpeler = -1;
        this.wedstrijd.teams = [];
        this.wedstrijd.spelers = [];
        if (this.wedstrijd.aantSpelers == 5) {
            const team1 = new WedTeam(0, 'Team A');
            team1.spelers.push(new WedSpeler(0, 0));
            team1.spelers.push(new WedSpeler(1, 0));
            const team2 = new WedTeam(1, 'Team B');
            team2.spelers.push(new WedSpeler(0, 1));
            team2.spelers.push(new WedSpeler(1, 1));
            this.wedstrijd.teams.push(team1);
            this.wedstrijd.teams.push(team2);
            this.idxActiveTeam = 0;
        }
        else {
            this.wedstrijd.spelers.push(new WedSpeler(0));
            if (this.wedstrijd.aantSpelers > 1) {
                this.wedstrijd.spelers.push(new WedSpeler(1));
            }
            if (this.wedstrijd.aantSpelers > 2) {
                this.wedstrijd.spelers.push(new WedSpeler(2));
            }
            if (this.wedstrijd.aantSpelers > 3) {
                this.wedstrijd.spelers.push(new WedSpeler(3));
            }
        }
        this.idxActiveSpeler = 0;
    }

    private setSpelersFilled() {
        this.spelersFilled = false;
        if (this.wedstrijd.aantSpelers == 0) {
            return;
        }
        if (this.wedstrijd.aantSpelers == 5) {
            this.spelersFilled = this.wedstrijd.teams.every(team => {
                return team.spelers.every(spl => spl.splId != '');
            });
            return;
        }
        this.spelersFilled = this.wedstrijd.spelers.every(spl => spl.splId != '');
    }

    private filterSpelerLijst() {
        if (this.verenigingFilter == '') {
            this.spelerLijst.filter(sp => sp.speler.verenigingIds.length == 0);
            return;
        }
        this.spelerLijst.filter(sp => {
            return sp.isLidVan(this.verenigingFilter);
        })
    }

    private setWedstrijdChanged() {
        this.wedstrijdChanged = false;
        if (this.wedstrijd.aantSpelers != this.wedOrig.aantSpelers) {
            this.wedstrijdChanged = true;
            return;
        }
        if (this.wedstrijd.aantSpelers == 5) {
            this.wedstrijdChanged = this.wedstrijd.teams.some((team, idxT) => {
                return team.spelers.some((spl, idxS) => {
                    return spl.splId != this.wedOrig.teams[idxT].spelers[idxS].splId;
                });
            });
        }
        else {
            this.wedstrijdChanged = this.wedstrijd.spelers.some((spl, idx) => {
                return spl.splId != this.wedOrig.spelers[idx].splId;
            });
        }
    }

    private copyWedstrijd(): Wedstrijd {
        return JSON.parse(JSON.stringify(this.wedOrig));
    }

    private fillAantalLijst(): void {
        this.aantalLijst.fillItems([
            '1 speler',
            '2 spelers',
            '3 spelers',
            '4 spelers',
            '4 (2 x 2) spelers'
        ]);
    }
}
