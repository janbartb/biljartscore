import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { OefWedstrijd } from '../../../model/oef-wedstrijd';
import { List } from '../../../model/list';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HelperService } from '../../../services/helper.service';
import { Button } from '../../../model/button';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';

class InpNumber {
    val: number = 0;
    oldVal: number = 0;
    valid: boolean = false;

    constructor(val: number) {
        this.val = this.oldVal = val;
    }

    hasChanged(): boolean {
        return this.val != this.oldVal;
    }

    reset(): void {
        this.val = this.oldVal;
    }
}

@Component({
    selector: 'app-wed-config',
    standalone: true,
    imports: [
        FormsModule,
        PageHeaderComponent,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './wed-config.component.html',
    styleUrl: './wed-config.component.css'
})
export class WedConfigComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    wedOrig: OefWedstrijd = new OefWedstrijd();
    wedstrijd: OefWedstrijd = new OefWedstrijd();
    wedstrijdChanged: boolean = false;

    optieLijst: List<string> = new List<string>();
    subOptieLijst: List<string> = new List<string>();
    activeLijst: number = 0;

    enterButton: Button = new Button('Enter', 'Ga verder', true);

    vastBrt: InpNumber = new InpNumber(0);
    vastCar: InpNumber = new InpNumber(0);
    gemBrt: InpNumber = new InpNumber(0);
    maxBrt: InpNumber = new InpNumber(0);
    inputValid: boolean = false;

    htmlVastBrt = viewChild<ElementRef<HTMLInputElement>>("vastbrt");
    htmlVastCar = viewChild<ElementRef<HTMLInputElement>>("vastcar");
    htmlGemBrt = viewChild<ElementRef<HTMLInputElement>>("gembrt");
    htmlMaxBrt = viewChild<ElementRef<HTMLInputElement>>("maxbrt");

    constructor() {
        super();
        effect(() => {
            this.htmlVastBrt()?.nativeElement.focus();
            this.htmlVastCar()?.nativeElement.focus();
            this.htmlGemBrt()?.nativeElement.focus();
        });
    }

    enterPressed() {
        if (this.activeLijst == 0) {
            this.optieClicked(0, this.optieLijst.hoveredIdx);
        }
        else {
            this.optieClicked(1, this.subOptieLijst.hoveredIdx);
        }
    }

    override escapePressed(): void {
        if (this.wedstrijdChanged) {
            this.resetWedstrijd();
            return;
        }
        if (this.activeLijst == 1) {
            this.activeLijst = 0;
            this.subOptieLijst.selectedIdx = this.subOptieLijst.hoveredIdx = -1;
            this.optieClicked(0, 0);
            this.setEscapeCount();
            return;
        }
        this.previousClicked();
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.gaVerderClicked();
            }
        }, 300);
    }

    previousClicked() {
        this.router.navigate(['wedstrijd/spelers']);
    }

    optieClicked(idxActive: number, idxOptie: number) {
        if (idxActive == 1 && this.activeLijst == 0) {
            return;
        }
        if (idxActive == 0) {
            this.activeLijst = 0;
            this.optieLijst.hoveredIdx = -1;
            this.subOptieLijst.selectedIdx = this.subOptieLijst.hoveredIdx = -1;
            if (idxOptie == 1) {
                this.optieLijst.selectItem(idxOptie);
                this.activeLijst = 1;
                if (this.subOptieLijst.selectedIdx < 0) {
                    this.subOptieLijst.selectItem(0);
                    this.helper.setFocus(this.htmlVastCar()?.nativeElement);
                }
            }
            else {
                this.optieLijst.selectItem(idxOptie);
                this.helper.setFocus(this.htmlVastBrt()?.nativeElement);
            }
        }
        else {
            this.subOptieLijst.selectItem(idxOptie);
            this.subOptieLijst.hoveredIdx = -1;
            if (idxOptie == 0) {
                this.helper.setFocus(this.htmlVastCar()?.nativeElement);
            }
            else {
                this.helper.setFocus(this.htmlGemBrt()?.nativeElement);
            }
        }
        this.validateInput();
        this.setEscapeCount();
    }

    gaVerderClicked() {
        this.wedstrijd.tsBeurten = 0;
        this.wedstrijd.tsCaramboles = 0;
        this.wedstrijd.maxBeurten = 0;
        if (this.activeLijst == 0) {
            this.wedstrijd.isVastAantBrt = true;
            this.wedstrijd.tsBeurten = Number(this.vastBrt.val);
        }
        else {
            this.wedstrijd.isVastAantBrt = false;
            this.wedstrijd.maxBeurten = Number(this.maxBrt.val);
            if (this.subOptieLijst.selectedIdx == 0) {
                this.wedstrijd.isVastAantCar = true;
                this.wedstrijd.tsCaramboles = Number(this.vastCar.val);
            }
            else {
                this.wedstrijd.isVastAantCar = false;
                this.wedstrijd.tsBeurten = Number(this.gemBrt.val);
            }
        }
        if (this.wedstrijdChanged) {
            this.wedstrijd.wedOver = false;
            this.helper.clearWedstrijdResultaten(this.wedstrijd);
            if (!this.wedstrijd.isVastAantBrt) {
                if (this.wedstrijd.aantSpelers == 5) {
                    this.berekenAantCarambolesVoorTeams();
                }
                else {
                    this.berekenAantCarambolesVoorSpelers();
                }    
            }
            else {
                this.wedstrijd.teams.forEach(team => {
                    team.teamTsGem = Math.round(1000 * ((team.spelers[0].splTsGem + team.spelers[1].splTsGem) / 2)) / 1000;
                    team.teamTsBrt = 2 * this.wedstrijd.tsBeurten;
                    team.spelers.forEach(spl => {
                        spl.splTsBrt = this.wedstrijd.tsBeurten;
                    });
                });
                this.wedstrijd.spelers.forEach(spl => {
                    spl.splTsBrt = this.wedstrijd.tsBeurten;
                });
            }
        }
        this.bssApi.saveWedstrijd(this.wedstrijd)
        .then(resp => {
            this.router.navigate(['wedstrijd']);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    validateInput() {
        this.hasWedstrijdChanged();
        this.inputValid = false;
        if (this.activeLijst == 0) {
            this.vastBrt.valid = this.helper.isValidInteger('' + this.vastBrt.val);
            this.inputValid = this.vastBrt.valid;
        }
        else {
            this.maxBrt.valid = this.helper.isValidIntegerOrZero('' + this.maxBrt.val);
            if (this.subOptieLijst.selectedIdx == 0) {
                this.vastCar.valid = this.helper.isValidInteger('' + this.vastCar.val);
                this.inputValid = this.maxBrt.valid && this.vastCar.valid;
            }
            else {
                this.gemBrt.valid = this.helper.isValidInteger('' + this.gemBrt.val);
                this.inputValid = this.maxBrt.valid && this.gemBrt.valid;
            }
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event);
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                if (this.activeLijst == 0) {
                    this.optieLijst.hoverPreviousItem();
                }
                else if (this.activeLijst == 1) {
                    this.subOptieLijst.hoverPreviousItem();
                }
                return false;
            }
            if (event.key === 'ArrowDown') {
                if (this.activeLijst == 0) {
                    this.optieLijst.hoverNextItem();
                }
                else if (this.activeLijst == 1) {
                    this.subOptieLijst.hoverNextItem();
                }
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (this.inputValid && this.optieLijst.hoveredIdx < 0 && this.subOptieLijst.hoveredIdx < 0) {
                this.buttonPressed(this.enterButton);
                return false;
            }
            if (this.optieLijst.hoveredIdx >= 0 || this.subOptieLijst.hoveredIdx >= 0) {
                this.enterPressed();
                return false;
            }
            return true;
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
        const opts = ['Speel een vast aantal beurten', 'Doorspelen tot het aantal caramboles is bereikt'];
        this.optieLijst.fillItems(opts);
        let subOpts = ['Een vast aantal caramboles voor iedere speler', 'Bereken aantal caramboles op basis van moyenne van speler'];
        Promise.all([
            this.bssApi.getWedstrijd()
        ])
        .then(results => {
            if (results[0].gevonden) {
                this.wedstrijd = results[0].wedstrijd;
            }
            if (!this.helper.areWedstrijdSpelersFilled(this.wedstrijd)) {
                this.escapePressed();
                return;
            }
            if (this.wedstrijd.aantSpelers == 5) {
                subOpts = ['Een vast aantal caramboles voor ieder team', 'Bereken aantal caramboles op basis van moyenne van team'];
            }
            console.log(this.wedstrijd);
            this.subOptieLijst.fillItems(subOpts);
            if (this.wedstrijd.isVastAantBrt) {
                this.activeLijst = 0;
                this.optieLijst.selectedIdx = 0;
                this.optieLijst.hoveredIdx = -1;
                this.vastBrt = new InpNumber(this.wedstrijd.tsBeurten);
            }
            else {
                this.optieLijst.selectedIdx = 1;
                this.optieLijst.hoveredIdx = -1;
                this.activeLijst = 1;
                this.subOptieLijst.selectedIdx = this.wedstrijd.isVastAantCar ? 0 : 1;
                this.subOptieLijst.hoveredIdx = -1;
                this.maxBrt = new InpNumber(this.wedstrijd.maxBeurten);
                if (this.wedstrijd.isVastAantCar) {
                    this.vastCar = new InpNumber(this.wedstrijd.tsCaramboles);
                }
                else {
                    this.gemBrt = new InpNumber(this.wedstrijd.tsBeurten);
                }
            }
            this.validateInput();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private berekenAantCarambolesVoorSpelers() {
        if (this.wedstrijd.isVastAantCar) {
            this.wedstrijd.spelers.forEach(spl => {
                spl.splTsCar = this.wedstrijd.tsCaramboles;
            });
        }
        else {
            this.wedstrijd.spelers.forEach(spl => {
                spl.splTsCar = Math.round(this.wedstrijd.tsBeurten * spl.splTsGem);
            });
        }
    }

    private berekenAantCarambolesVoorTeams() {
        if (this.wedstrijd.isVastAantCar) {
            this.wedstrijd.teams.forEach(team => {
                team.teamTsGem = Math.round(1000 * ((team.spelers[0].splTsGem + team.spelers[1].splTsGem) / 2)) / 1000;
                team.teamTsCar = this.wedstrijd.tsCaramboles;
                const totGem = team.spelers[0].splTsGem + team.spelers[1].splTsGem;
                team.spelers[0].splTsCar = Math.round((team.spelers[0].splTsGem / totGem) * team.teamTsCar);
                team.spelers[1].splTsCar = team.teamTsCar - team.spelers[0].splTsCar;
            });
        }
        else {
            this.wedstrijd.teams.forEach(team => {
                team.teamTsGem = Math.round(1000 * ((team.spelers[0].splTsGem + team.spelers[1].splTsGem) / 2)) / 1000;
                team.teamTsCar = Math.round(team.teamTsGem * this.wedstrijd.tsBeurten);
                const totGem = team.spelers[0].splTsGem + team.spelers[1].splTsGem;
                team.spelers[0].splTsCar = Math.round((team.spelers[0].splTsGem / totGem) * team.teamTsCar);
                team.spelers[1].splTsCar = team.teamTsCar - team.spelers[0].splTsCar;
            });
        }
    }

    private resetWedstrijd() {
        if (this.activeLijst == 0) {
            this.vastBrt.reset();
        }
        else {
            if (this.subOptieLijst.selectedIdx == 0) {
                this.vastCar.reset();
                this.maxBrt.reset();
            }
            else {
                this.gemBrt.reset();
                this.maxBrt.reset();
            }
        }
        this.validateInput();
        this.setEscapeCount();
    }

    private hasWedstrijdChanged() {
        if (this.activeLijst == 0) {
            this.wedstrijdChanged = this.vastBrt.hasChanged();
        }
        else {
            if (this.subOptieLijst.selectedIdx == 0) {
                this.wedstrijdChanged = this.vastCar.hasChanged() || this.maxBrt.hasChanged();
            }
            else {
                this.wedstrijdChanged = this.gemBrt.hasChanged() || this.maxBrt.hasChanged();
            }
        }
        this.setEscapeCount();
    }

    setEscapeCount() {
        this.escapeCount = 0;
        if (this.wedstrijdChanged) {
            this.escapeCount++;
        }
        if (this.activeLijst == 1) {
            this.escapeCount++;
        }
    }

}
