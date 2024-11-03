import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { WedSpelerStand, Wedstrijd, WedTeamStand } from '../../../model/wedstrijd';
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

    wedOrig: Wedstrijd = new Wedstrijd();
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedstrijdChanged: boolean = false;

    optieLijst: List<string> = new List<string>();
    subOptieLijst: List<string> = new List<string>();
    activeOpties = 0;

    enterButton: Button = new Button('Ctrl+Enter', 'Ga verder', true);

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
            this.htmlMaxBrt()?.nativeElement.focus();
        });
    }

    enterPressed() {
        if (this.activeOpties == 0) {
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
        if (this.activeOpties == 1) {
            this.activeOpties = 0;
            this.optieClicked(0, 0);
            return;
        }
        this.router.navigate(['wedstrijd/spelers']);
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Ctrl+Enter') {
                this.gaVerderClicked();
            }
        }, 300);
    }

    optieClicked(idxActive: number, idxOptie: number) {
        if (idxActive == 1 && this.activeOpties == 0) {
            return;
        }
        if (idxActive == 0) {
            this.activeOpties = 0;
            if (idxOptie == 1) {
                this.optieLijst.selectItem(idxOptie);
                this.activeOpties = 1;
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
            if (idxOptie == 0) {
                this.helper.setFocus(this.htmlVastCar()?.nativeElement);
            }
            else {
                this.helper.setFocus(this.htmlGemBrt()?.nativeElement);
            }
        }
        this.validateInput();
    }

    gaVerderClicked() {
        this.wedstrijd.tsBeurten = 0;
        this.wedstrijd.tsCaramboles = 0;
        this.wedstrijd.maxBeurten = 0;
        if (this.activeOpties == 0) {
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
        if (this.activeOpties == 0) {
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
                if (this.activeOpties == 0) {
                    this.optieLijst.hoverPreviousItem();
                }
                else if (this.activeOpties == 1) {
                    this.subOptieLijst.hoverPreviousItem();
                }
                return false;
            }
            if (event.key === 'ArrowDown') {
                if (this.activeOpties == 0) {
                    this.optieLijst.hoverNextItem();
                }
                else if (this.activeOpties == 1) {
                    this.subOptieLijst.hoverNextItem();
                }
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            if (event.ctrlKey) {
                this.buttonPressed(this.enterButton);
            }
            else {
                this.enterPressed();
            }
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
        const opts = ['Speel door tot aantal beurten is bereikt', 'Speel door tot aantal caramboles is bereikt'];
        this.optieLijst.fillItems(opts);
        const subOpts = ['Vast aantal caramboles voor iedere speler', 'Bepaal aantal caramboles op basis van gemiddelde van speler'];
        this.subOptieLijst.fillItems(subOpts);
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
            if (this.wedstrijd.isVastAantBrt) {
                this.activeOpties = 0;
                this.optieLijst.selectedIdx = this.optieLijst.hoveredIdx = 0;
                this.vastBrt = new InpNumber(this.wedstrijd.tsBeurten);
            }
            else {
                this.optieLijst.hoveredIdx = 1;
                this.activeOpties = 1;
                this.subOptieLijst.selectedIdx = this.subOptieLijst.hoveredIdx = this.wedstrijd.isVastAantCar ? 0 : 1;
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

    private resetWedstrijd() {
        if (this.activeOpties == 0) {
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
    }

    private hasWedstrijdChanged() {
        if (this.activeOpties == 0) {
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
    }

}
