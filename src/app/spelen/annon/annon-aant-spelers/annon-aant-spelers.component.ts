import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { AnnonCat, Annonceer, AnnonConfig, AnnonSpeler } from '../../../model/annonceer';
import { List } from '../../../model/list';
import { Button } from '../../../model/button';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { NgClass } from '@angular/common';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { FormsModule } from '@angular/forms';
import { HelperService } from '../../../services/helper.service';

@Component({
    selector: 'app-annon-aant-spelers',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './annon-aant-spelers.component.html',
    styleUrl: './annon-aant-spelers.component.css'
})
export class AnnonAantSpelersComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);
    annon: Annonceer = new Annonceer();
    origConfig: AnnonConfig = new AnnonConfig();
    aantalLijst: List<string> = new List<string>();
    annonChanged: boolean = false;
    activeSection: number = 1;
    spelKeuze: boolean = false;
    optieKeuze: boolean = false;
    inpCars: number = 0;
    inputOk: boolean = true;

    sectButtons: Button[] = [
        new Button('Enter', 'Selecteer', true)
    ];
    pageButtons: Button[] = [
        new Button('Enter', 'Naar spelers', true)
    ];

    override escapePressed(): void {
        this.router.navigate(['spelkeuze']);
    }

    buttonPressed() {
        let button = this.pageButtons[0];
        if (this.aantalLijst.hoveredIdx >= 0 && this.aantalLijst.hoveredIdx != this.aantalLijst.selectedIdx) {
            button = this.sectButtons[0];
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.text == 'Selecteer') {
                this.sectButtonClicked();
            }
            else {
                this.pageButtonClicked();
            }
        }, 300);
    }

    pageButtonClicked() {
        if (this.aantalLijst.selectedIdx >= 0 && (this.optieKeuze || this.inputOk)) {
            this.saveWedstrijdAndContinue();
        }
    }

    sectButtonClicked() {
        this.aantalClicked(this.aantalLijst.hoveredIdx);
    }

    aantalClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.activeSection = 1;
        const aantSpl = idx + 1;
        if (aantSpl == this.annon.config.aantSpelers) {
            return;
        }
        this.aantalLijst.selectedIdx = this.aantalLijst.hoveredIdx = idx;
    }

    selectSpelOptie(isAnnon: boolean) {
        this.activeSection = 0;
        if (isAnnon != this.spelKeuze) {
            this.spelKeuze = this.annon.config.isAnnonceer = isAnnon;
            this.setConfigSpel(this.annon.config, this.spelKeuze);
        }
    }

    selectCarsOptie(obvMoy: boolean) {
        this.optieKeuze = this.annon.config.carsObvMoyenne = obvMoy;
        this.activeSection = 2;
    }

    private changeSection(direction: number) {
        let idx = this.activeSection + direction;
        if (idx < 0) {
            idx = 2;
        }
        if (idx > 2) {
            idx = 0;
        }
        this.maakSectionActief(idx);
    }

    maakSectionActief(idx: number) {
        this.activeSection = idx;
        if (this.activeSection == 2) {
            this.aantalLijst.hoveredIdx = this.aantalLijst.selectedIdx;
        }
    }

    checkInput() {
        this.inputOk = false;
        if (!this.helper.isValidInteger('' + this.inpCars)) {
            return;
        }
        if (this.inpCars < 3 || this.inpCars > 10) {
            return;
        }
        this.inputOk = true;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydownEvent(event: KeyboardEvent): boolean {
        if (this.activeSection == 1 && (event.key ==='ArrowUp' || event.key ==='ArrowDown')) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event);
        console.log(event.code + ' : ' + event.key);
        const fromInput = event.target instanceof HTMLInputElement;
        if (event.key ==='ArrowLeft' || event.key ==='ArrowRight') {
            if (event.key === 'ArrowLeft') {
                this.changeSection(-1);
                return false;
            }
            if (event.key === 'ArrowRight') {
                this.changeSection(1);
                return false;
            }
            return true;
        }
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (this.activeSection == 2 && fromInput) {
                return true;
            }
            if (event.key === 'ArrowUp') {
                if (this.activeSection == 0) {
                    this.selectSpelOptie(!this.spelKeuze);
                }
                else if (this.activeSection == 1) {
                    this.aantalLijst.hoverPreviousItem();
                }
                else if (this.activeSection == 2) {
                    this.selectCarsOptie(!this.optieKeuze);
                }
                return false;
            }
            if (event.key === 'ArrowDown') {
                if (this.activeSection == 0) {
                    this.selectSpelOptie(!this.spelKeuze);
                }
                else if (this.activeSection == 1) {
                    this.aantalLijst.hoverNextItem();
                }
                else if (this.activeSection == 2) {
                    this.selectCarsOptie(!this.optieKeuze);
                }
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            this.buttonPressed();
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
        this.bssApi.getAnnonWedstrijd()
        .then(resp => {
            if (resp.gevonden) {
                this.annon = resp.annon;
                if (this.annon.config.aantSpelers > 0) {
                    this.aantalLijst.selectedIdx = this.aantalLijst.hoveredIdx = this.annon.config.aantSpelers - 1;
                }
                this.origConfig = JSON.parse(JSON.stringify(this.annon.config));
                this.spelKeuze = this.annon.config.isAnnonceer;
                this.optieKeuze = this.annon.config.carsObvMoyenne;
                this.inpCars = this.annon.config.vastAantCars;
                this.inputOk = this.helper.isValidInteger('' + this.inpCars) && this.inpCars > 2 && this.inpCars < 11;
            }
            else {
                this.inputOk = false;
                this.setConfigSpel(this.annon.config);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private configChanged(): boolean {
        if (this.spelKeuze != this.origConfig.isAnnonceer) {
            return true;
        }
        if (this.optieKeuze != this.origConfig.carsObvMoyenne) {
            return true;
        }
        if (this.aantalLijst.selectedIdx != this.origConfig.aantSpelers - 1) {
            return true;
        }
        if (!this.optieKeuze && this.inpCars != this.origConfig.vastAantCars) {
            return true;
        }
        return false;
    }

    private initWedstrijd() {
        this.annon = new Annonceer();
        this.annon.config = new AnnonConfig();
        this.setConfigSpel(this.annon.config, this.spelKeuze);
        this.annon.config.aantSpelers = this.aantalLijst.selectedIdx + 1;
        this.annon.config.carsObvMoyenne = this.optieKeuze;
        this.annon.config.vastAantCars = this.inpCars;
        this.annon.spelers.push(new AnnonSpeler(this.annon.config.cats.length));
        if (this.annon.config.aantSpelers > 1) {
            this.annon.spelers.push(new AnnonSpeler(this.annon.config.cats.length));
        }
        if (this.annon.config.aantSpelers > 2) {
            this.annon.spelers.push(new AnnonSpeler(this.annon.config.cats.length));
        }
        if (this.annon.config.aantSpelers > 3) {
            this.annon.spelers.push(new AnnonSpeler(this.annon.config.cats.length));
        }
    }

    private setConfigSpel(config: AnnonConfig, isAnnon?: boolean) {
        config.isAnnonceer = isAnnon ? true : false;
        config.cats = [];
        if (config.isAnnonceer) {
            config.cats.push(new AnnonCat('rood', 'Over rood'));
            config.cats.push(new AnnonCat('dir', 'Direct'));
            config.cats.push(new AnnonCat('los', 'Losse band', 'Losseband'));
            config.cats.push(new AnnonCat('drie', 'Drieband'));        
        }
        else {
            config.cats.push(new AnnonCat('dir', 'Direct'));
            config.cats.push(new AnnonCat('1', '1 band', 'Eenband'));
            config.cats.push(new AnnonCat('2', '2 band', 'Tweeband'));
            config.cats.push(new AnnonCat('3', '3 band', 'Drieband'));
            config.cats.push(new AnnonCat('los', 'Los band', 'Losband'));
        }
    }

    private saveWedstrijdAndContinue() {
        if (!this.configChanged()) {
            this.router.navigate(['annon/spelers']);
            return;
        }
        this.initWedstrijd();
        this.bssApi.saveAnnonWedstrijd(this.annon)
        .then(resp => {
            this.router.navigate(['annon/spelers']);
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
            '4 spelers'
        ]);
    }
}
