import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { CmpAantWedGespeeld, CmpSpelerTotalen, Competitie } from '../../../model/competitie';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { Button } from '../../../model/button';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
    selector: 'app-eigen-competitie',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ButtonComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './eigen-competitie.component.html',
    styleUrl: './eigen-competitie.component.css'
})
export class EigenCompetitieComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    title: string = '';
    subtitles: string[] = ['totaal'];
    competitie: Competitie = new Competitie('');
    totalen: CmpSpelerTotalen[] = [];
    teSplWedPerRonde: number = 0;
    teSplWedTotaal: number = 0;
    aantWedGespeeld: CmpAantWedGespeeld = new CmpAantWedGespeeld();
    idxSpeler: number = -1;
    idxRonde: number = 0;
    escapeCount: number = 0;

    schemaButton: Button = new Button('S', 'Schema', true);
    planningButton: Button = new Button('P', 'Planning', true);
    wedButton: Button = new Button('Enter', 'Wedstrijden', true);
    rondeButtons: Button[] = [];

    override escapePressed(): void {
        if (this.idxSpeler >= 0) {
            this.idxSpeler = -1;
            this.setEscapeCount();
            return;
        }
        this.router.navigate(['eigencomps']);
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'S') {
                this.schemaButtonClicked();
            }
            else if (button.key == 'P') {
                this.planningButtonClicked();
            }
            else if (button.key == 'Enter') {
                this.spelerClicked(this.idxSpeler);
            }
        }, 300);
    }

    spelerClicked(idx: number) {
        const selected = this.totalen[idx];
        const naam = this.competitie.cmpNaam;
        const splId = selected.speler.splId;
        const ronde = (this.idxRonde > 0) ? this.idxRonde - 1 : this.idxRonde;
        this.router.navigate([`eigencomps/${naam}/${splId}/${ronde}`]);
    }

    schemaButtonClicked() {
        const naam = this.competitie.cmpNaam;
        const ronde = (this.idxRonde > 0) ? this.idxRonde - 1 : this.idxRonde;
        this.router.navigate([`eigencomps/${naam}/schema/${ronde}`]);
    }

    planningButtonClicked() {
        const naam = this.competitie.cmpNaam;
        const ronde = (this.idxRonde > 0) ? this.idxRonde - 1 : this.idxRonde;
        this.router.navigate([`eigencomps/${naam}/planning/${ronde}`]);
    }

    rondeButtonClicked(idx: number) {
        if (idx >= this.rondeButtons.length) {
            return;
        }
        this.rondeButtons.forEach((btn, i) => {
            btn.selected = (i == idx);
        });
        this.idxRonde = idx;
        this.sortOverzicht(idx);
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent): boolean {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
        return true;
    }    
    
    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.selectNextItem(-1);
            }
            if (event.key === 'ArrowDown') {
                this.selectNextItem(1);
            }
            this.setEscapeCount();
            return false;
        }
        if (this.competitie.cmpAantRondes > 1) {
            if (event.key ==='ArrowLeft' || event.key === 'ArrowRight') {
                if (event.key === 'ArrowLeft') {
                    this.selectNextRonde(-1);
                }
                if (event.key === 'ArrowRight') {
                    this.selectNextRonde(1);
                }
                return false;
            }    
        }
        if (event.code === 'KeyS') {
            this.buttonPressed(this.schemaButton);
            return false;
        }
        if (event.code === 'KeyP') {
            this.buttonPressed(this.planningButton);
            return false;
        }
        if (event.key === 'Enter' && this.idxSpeler >= 0) {
            this.buttonPressed(this.wedButton);
            return false;
        }
        if (event.code.startsWith('Digit')) {
            const digit = event.code.substring(5);
            this.rondeButtonClicked(+digit);
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
        const naam: string | null = this.route.snapshot.paramMap.get('naam');
        if (!naam) {
            this.alert.showAlert('De competitienaam in de URL is niet geldig.', 'error');
            return;
        }
        this.bssApi.getCompetitie(naam)
        .then(data => {
            if (data.gevonden) {
                this.competitie = data.comp;
            }
            else {
                this.alert.showError(`Competitiebestand '${naam}.json' niet gevonden.`);
                return;
            }
            this.title = `Competitie '${this.competitie.cmpNaam}'`;
            const aantSpl = this.competitie.cmpSpelers.length;
            this.teSplWedPerRonde = aantSpl * (aantSpl - 1) / 2;
            this.teSplWedTotaal = this.competitie.cmpAantRondes * this.teSplWedPerRonde;
            this.berekenTotalen();

            for (let i = 0; i < this.competitie.cmpAantRondes; i++) {
                let txt = 'ronde ' + (i + 1);
                if (this.aantWedGespeeld.klaar[i + 1]) {
                    txt += ' - (afgesloten)';
                }
                this.subtitles.push(txt);
            }
            if (this.aantWedGespeeld.klaar[0]) {
                this.subtitles[0] += ' - (afgesloten)';
            }

            if (this.competitie.cmpAantRondes > 1) {
                for (let i = 0; i <= this.competitie.cmpAantRondes; i++) {
                    this.rondeButtons.push(new Button('' + i, '', false, true));
                }
                this.rondeButtons[0].selected = true;
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private selectNextItem(direction: number) {
        if (this.totalen.length == 0) {
            return;
        }
        let idx = this.idxSpeler;
        idx = idx + direction;
        if (idx < 0) {
            idx = this.totalen.length - 1;
        }
        else if (idx >= this.totalen.length) {
            idx = 0;
        }
        this.idxSpeler = idx;
    }

    private selectNextRonde(direction: number) {
        let idx = this.idxRonde;
        idx = idx + direction;
        if (idx < 0) {
            idx = this.competitie.cmpAantRondes;
        }
        else if (idx > this.competitie.cmpAantRondes) {
            idx = 0;
        }
        this.rondeButtonClicked(idx);
    }

    private berekenTotalen() {
        this.competitie.cmpSpelers.forEach(speler => {
            let splTotalen: CmpSpelerTotalen = new CmpSpelerTotalen(speler, this.competitie.cmpAantRondes);
            speler.splRondes.forEach((ronde, idx) => {
                const wedsGereed = ronde.wedstrijden.filter(wed => wed.wedOver);
                splTotalen.rondeTotalen[ronde.rondeNr].aantWed = wedsGereed.length;
                wedsGereed.forEach(wed => {
                    splTotalen.rondeTotalen[ronde.rondeNr].aantCar += wed.aantCar;
                    splTotalen.rondeTotalen[ronde.rondeNr].aantBrt += wed.aantBrt;
                    splTotalen.rondeTotalen[ronde.rondeNr].aantPnt += wed.aantPnt;
                    if (wed.hoogSer > splTotalen.rondeTotalen[ronde.rondeNr].hoogSer) {
                        splTotalen.rondeTotalen[ronde.rondeNr].hoogSer = wed.hoogSer;
                    }
                });
                if (splTotalen.rondeTotalen[ronde.rondeNr].aantBrt > 0) {
                    splTotalen.rondeTotalen[ronde.rondeNr].moyenne = splTotalen.rondeTotalen[ronde.rondeNr].aantCar / splTotalen.rondeTotalen[ronde.rondeNr].aantBrt;
                }
                splTotalen.rondeTotalen[ronde.rondeNr].perc = 100 * splTotalen.rondeTotalen[ronde.rondeNr].moyenne / speler.splMoyenne;

                splTotalen.rondeTotalen[0].aantWed += splTotalen.rondeTotalen[ronde.rondeNr].aantWed;
                splTotalen.rondeTotalen[0].aantCar += splTotalen.rondeTotalen[ronde.rondeNr].aantCar;
                splTotalen.rondeTotalen[0].aantBrt += splTotalen.rondeTotalen[ronde.rondeNr].aantBrt;
                splTotalen.rondeTotalen[0].aantPnt += splTotalen.rondeTotalen[ronde.rondeNr].aantPnt;
                if (splTotalen.rondeTotalen[ronde.rondeNr].hoogSer > splTotalen.rondeTotalen[0].hoogSer) {
                    splTotalen.rondeTotalen[0].hoogSer = splTotalen.rondeTotalen[ronde.rondeNr].hoogSer;
                }
            });
            if (splTotalen.rondeTotalen[0].aantBrt > 0) {
                splTotalen.rondeTotalen[0].moyenne = splTotalen.rondeTotalen[0].aantCar / splTotalen.rondeTotalen[0].aantBrt;
            }
            splTotalen.rondeTotalen[0].perc = 100 * splTotalen.rondeTotalen[0].moyenne / speler.splMoyenne;

            this.totalen.push(splTotalen);
        });
        for (let i = 0; i <= this.competitie.cmpAantRondes; i++) {
            this.aantWedGespeeld.rondes.push(0);
            this.aantWedGespeeld.klaar.push(false);
        }
        this.totalen.forEach(splTot => {
            splTot.rondeTotalen.forEach(ronde => {
                this.aantWedGespeeld.rondes[ronde.rondeNr] += ronde.aantWed;
            });
        });
        this.aantWedGespeeld.rondes = this.aantWedGespeeld.rondes.map(ronde => ronde / 2);
        this.aantWedGespeeld.klaar = this.aantWedGespeeld.klaar.map((isKlaar, i) => {
            if (i == 0) {
                return this.aantWedGespeeld.rondes[i] == this.teSplWedTotaal;
            }
            else {
                return this.aantWedGespeeld.rondes[i] == this.teSplWedPerRonde;
            }
        })

        this.sortOverzicht(this.idxRonde);
    }

    private sortOverzicht(nr: number) {
        this.totalen.sort((a: CmpSpelerTotalen, b: CmpSpelerTotalen) => {
            if (a.rondeTotalen[nr].aantPnt == b.rondeTotalen[nr].aantPnt) {
                if (a.rondeTotalen[nr].aantWed == b.rondeTotalen[nr].aantWed) {
                    if (a.rondeTotalen[nr].perc == b.rondeTotalen[nr].perc) {
                        if (a.speler.splMoyenne == b.speler.splMoyenne) {
                            return a.speler.splNaam > b.speler.splNaam ? 1 : -1;
                        }
                        else {
                            return b.speler.splMoyenne - a.speler.splMoyenne;
                        }
                    }
                    else {
                        return b.rondeTotalen[nr].perc - a.rondeTotalen[nr].perc;
                    }
                }
                else {
                    return a.rondeTotalen[nr].aantWed - b.rondeTotalen[nr].aantWed;
                }
            }
            else {
                return b.rondeTotalen[nr].aantPnt - a.rondeTotalen[nr].aantPnt;
            }
        });
    }

    private setEscapeCount() {
        this.escapeCount = 0;
        if (this.idxSpeler >= 0) {
            this.escapeCount++;
        }
    }
}
