import { Component, HostListener, OnInit } from '@angular/core';
import { OefWedSpeler, OefWedstrijd, OefWedTeam } from '../../../model/oef-wedstrijd';
import { List } from '../../../model/list';
import { BaseComponent } from '../../../base/base.component';
import { Button } from '../../../model/button';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { NgClass } from '@angular/common';

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
    wedstrijd: OefWedstrijd = new OefWedstrijd();
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
        this.initWedstrijd(aantSpl);
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
        this.bssApi.getOefenWedstrijd()
        .then(resp => {
            if (resp.gevonden) {
                this.wedstrijd = resp.wedstrijd;
                if (this.wedstrijd.aantSpelers > 0) {
                    this.aantalLijst.selectedIdx = this.aantalLijst.hoveredIdx = this.wedstrijd.aantSpelers - 1;
                }
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private initWedstrijd(aantSpl: number) {
        this.wedstrijd = new OefWedstrijd();
        this.wedstrijd.aantSpelers = aantSpl;
        if (this.wedstrijd.aantSpelers == 5) {
            const team1 = new OefWedTeam(0, 'Team A');
            team1.spelers.push(new OefWedSpeler(0, 0));
            team1.spelers.push(new OefWedSpeler(1, 0));
            const team2 = new OefWedTeam(1, 'Team B');
            team2.spelers.push(new OefWedSpeler(0, 1));
            team2.spelers.push(new OefWedSpeler(1, 1));
            this.wedstrijd.teams.push(team1);
            this.wedstrijd.teams.push(team2);
        }
        else {
            this.wedstrijd.spelers.push(new OefWedSpeler(0));
            if (this.wedstrijd.aantSpelers > 1) {
                this.wedstrijd.spelers.push(new OefWedSpeler(1));
            }
            if (this.wedstrijd.aantSpelers > 2) {
                this.wedstrijd.spelers.push(new OefWedSpeler(2));
            }
            if (this.wedstrijd.aantSpelers > 3) {
                this.wedstrijd.spelers.push(new OefWedSpeler(3));
            }
        }
    }

    private saveWedstrijdAndContinue() {
        this.bssApi.saveOefenWedstrijd(this.wedstrijd)
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
