import { Component, HostListener, OnInit } from '@angular/core';
import { List } from '../../../model/list';
import { BaseComponent } from '../../../base/base.component';
import { Button } from '../../../model/button';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { NgClass } from '@angular/common';
import { WedSpeler, Wedstrijd, WedTeam } from '../../../model/wedstrijd';

@Component({
    selector: 'app-wed-aant-spelers',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass
    ],
    templateUrl: './wed-aant-spelers.component.html',
    styleUrl: './wed-aant-spelers.component.css'
})
export class WedAantSpelersComponent extends BaseComponent implements OnInit {
    subtitle: string = 'Oefen wedstrijd - aantal spelers';
    wedstrijd: Wedstrijd = new Wedstrijd();
    aantalLijst: List<string> = new List<string>();
    wedstrijdChanged: boolean = false;

    buttons: Button[] = [
        new Button('Enter', 'Selecteer', true)
    ];

    override escapePressed(): void {
        this.router.navigate(['spelkeuze']);
    }

    buttonPressed(idx: number) {
        this.buttons[idx].selected = true;
        setTimeout(() => {
            this.buttons[idx].selected = false;
            this.buttonClicked(idx);
        }, 300);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.aantalClicked(this.aantalLijst.hoveredIdx);
        }
    }

    aantalClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        const aantSpl = idx + 1;
        if (this.wedstrijd.aantSpelers == aantSpl) {
            this.router.navigate(['wedstrijd/spelers']);
            return;
        }
        this.initWedstrijd(aantSpl, this.wedstrijd.regels.idxOptie == 4);
        this.saveWedstrijdAndContinue();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event);
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.aantalLijst.hoverPreviousItem();
                return false;
            }
            if (event.key === 'ArrowDown') {
                this.aantalLijst.hoverNextItem();
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(0);
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
        this.bssApi.getWedstrijd()
        .then(resp => {
            if (resp.gevonden) {
                this.wedstrijd = resp.wedstrijd;
                if (this.wedstrijd.aantSpelers > 0) {
                    this.aantalLijst.selectedIdx = this.aantalLijst.hoveredIdx = this.wedstrijd.aantSpelers - 1;
                }
                if (this.wedstrijd.regels.idxOptie == 4) {
                    this.subtitle = 'Wedstrijd - aantal spelers';
                }
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private initWedstrijd(aantSpl: number, isVijfde: boolean) {
        this.wedstrijd = new Wedstrijd();
        if (isVijfde) {
            this.wedstrijd.regels.idxOptie = 4;
            this.wedstrijd.telling.idxOptie = 2;
        }
        this.wedstrijd.aantSpelers = aantSpl;
        if (this.wedstrijd.aantSpelers == 5) {
            const team1 = new WedTeam();
            team1.teamNaam = 'Team A';
            team1.spelers.push(new WedSpeler());
            team1.spelers.push(new WedSpeler());
            const team2 = new WedTeam();
            team2.teamNaam = 'Team B';
            team2.spelers.push(new WedSpeler());
            team2.spelers.push(new WedSpeler());
            this.wedstrijd.teams.push(team1);
            this.wedstrijd.teams.push(team2);
        }
        else {
            this.wedstrijd.spelers.push(new WedSpeler());
            if (this.wedstrijd.aantSpelers > 1) {
                this.wedstrijd.spelers.push(new WedSpeler());
            }
            if (this.wedstrijd.aantSpelers > 2) {
                this.wedstrijd.spelers.push(new WedSpeler());
            }
            if (this.wedstrijd.aantSpelers > 3) {
                this.wedstrijd.spelers.push(new WedSpeler());
            }
        }
    }

    private saveWedstrijdAndContinue() {
        this.bssApi.saveWedstrijd(this.wedstrijd)
        .then(resp => {
            this.router.navigate(['wedstrijd/spelers']);
        })
        .catch(err => {
            this.alert.showError(err);
        });
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
