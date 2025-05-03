import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { CmpAantWedGespeeld, CmpSchemaRonde, CmpSchemaSpeler, CmpSchemaWedstrijd, CmpSpelerTotalen, Competitie } from '../../../../model/competitie';
import { Button } from '../../../../model/button';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/button-group/button/button.component';
import { NgClass } from '@angular/common';

class Raster {
    cellw: number = 0;
    cellh: number = 0;
    topCellh: number = 0;
    leftCellw: number = 0;
    cssScale: string = 'scale100';
    fontsize: number = 20;
    arr: number[] = [];
}

@Component({
    selector: 'app-eigen-competitie-schema',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './eigen-competitie-schema.component.html',
    styleUrl: './eigen-competitie-schema.component.css'
})
export class EigenCompetitieSchemaComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    title: string = '';
    subtitles: string[] = [];
    competitie: Competitie = new Competitie('');
    schema: CmpSchemaRonde = new CmpSchemaRonde();
    totalen: CmpSpelerTotalen[] = [];
    teSplWedPerRonde: number = 0;
    teSplWedTotaal: number = 0;
    aantWedGespeeld: CmpAantWedGespeeld = new CmpAantWedGespeeld();
    raster: Raster = new Raster();
    idxRonde: number = 0;
    idxSpl: number = -1;
    idxTeg: number = -1;

    wedButton: Button = new Button('Enter', 'Naar wedstrijd', true);
    planButton: Button = new Button('P', 'Planning', true);
    rondeButtons: Button[] = [];

    override escapePressed(): void {
        if (this.escapeCount > 0) {
            this.idxSpl = -1;
            this.idxTeg = -1;
            this.setEscapeCount(0);
            return;
        }
        this.appData.previousPage();
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.naarWedstrijdClicked();
            }
            else if (button.key == 'P') {
                this.planningClicked();
            }
        }, 300);
    }

    wedstrijdClicked(idxS: number, idxT: number) {
        if (idxS == idxT) {
            return;
        }
        if (this.idxSpl == idxS && this.idxTeg == idxT) {
            this.naarWedstrijdClicked();
            return;
        }
        this.idxSpl = idxS;
        this.idxTeg = idxT;
        this.setEscapeCount(1);
    }

    naarWedstrijdClicked() {
        const splId = this.totalen[this.idxSpl].speler.splId;
        const tegId = this.totalen[this.idxTeg].speler.splId;
        const idxS = this.competitie.cmpSpelers.findIndex(sp => sp.splId == splId);
        const idxT = this.competitie.cmpSpelers.findIndex(sp => sp.splId == tegId);
        const toUrl = `eigencomps/${this.competitie.cmpNaam}/match/${this.idxRonde}/${idxS}/${idxT}`;
        this.appData.gotoPage(this.router.url, toUrl);
    }

    planningClicked() {
        const toUrl = `eigencomps/${this.competitie.cmpNaam}/planning/${this.idxRonde}`;
        this.appData.gotoPage(this.router.url, toUrl);
    }

    rondeButtonClicked(rondeNr: number) {
        if (rondeNr > this.rondeButtons.length) {
            return;
        }
        this.rondeButtons.forEach((btn, i) => {
            btn.selected = (i == (rondeNr - 1));
        });
        this.idxRonde = (rondeNr - 1);
        this.schema = this.createRondeSchema(this.idxRonde);
        this.idxSpl = -1;
        this.idxTeg = -1;
        this.setEscapeCount(0);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return true;
        }
        if (event.key ==='ArrowLeft' || event.key === 'ArrowRight') {
            if (event.key === 'ArrowLeft') {
                this.moveHorizontal(-1);
            }
            if (event.key === 'ArrowRight') {
                this.moveHorizontal(1);
            }
            return false;
        }    
        if (event.key ==='ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.moveVertical(-1);
            }
            if (event.key === 'ArrowDown') {
                this.moveVertical(1);
            }
            return false;
        }    
        if (event.code == 'KeyP') {
            this.buttonPressed(this.planButton);
            return false;
        }
        if (event.code.startsWith('Digit')) {
            const digit = event.code.substring(5);
            this.rondeButtonClicked(+digit);
            return false;
        }
        if (event.key === 'Enter') {
            if (!(this.idxSpl < 0 || this.idxTeg < 0 || this.idxSpl == this.idxTeg)) {
                this.buttonPressed(this.wedButton);
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
        const naam: string | null = this.route.snapshot.paramMap.get('naam');
        if (!naam) {
            this.alert.showAlert('De competitienaam in de URL is niet geldig.', 'error');
            return;
        }
        const ronde: string | null = this.route.snapshot.paramMap.get('ronde');
        if (!ronde) {
            this.alert.showAlert('De ronde parameter in de URL is niet geldig.', 'error');
            return;
        }
        this.idxRonde = +ronde;
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
            
            if (this.competitie.cmpAantRondes < 2) {
                this.subtitles.push('');
            }
            else {
                for (let i = 0; i < this.competitie.cmpAantRondes; i++) {
                    let txt = 'ronde ' + (i + 1);
                    this.subtitles.push(txt);
                    this.rondeButtons.push(new Button('' + (i + 1), '', false, true));
                }
                this.rondeButtons[this.idxRonde].selected = true;
            }
            this.raster = this.createRaster();
            this.berekenTotalen();
            this.sortTotalen(this.idxRonde);
            this.schema = this.createRondeSchema(this.idxRonde);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private moveHorizontal(direction: number) {
        let idxH = this.idxTeg;
        let idxV = this.idxSpl;
        if (idxH < 0 && idxV < 0) {
            this.idxSpl = 0;
            this.idxTeg = 1;
            this.setEscapeCount(1);
            return;
        }
        idxH += direction;
        if (idxH == idxV) {
            idxH += direction;
        }
        if (idxH >= this.schema.spelers.length) {
            idxH = 0;
            if (idxH == idxV) {
                idxH += direction;
            }
        }
        else if (idxH < 0) {
            idxH = this.schema.spelers.length - 1;
            if (idxH == idxV) {
                idxH += direction;
            }
        }
        this.idxSpl = idxV;
        this.idxTeg = idxH;
        this.setEscapeCount(1);
    }

    private moveVertical(direction: number) {
        let idxH = this.idxTeg;
        let idxV = this.idxSpl;
        if (idxH < 0 && idxV < 0) {
            this.idxSpl = 1;
            this.idxTeg = 0;
            this.setEscapeCount(1);
            return;
        }
        idxV += direction;
        if (idxH == idxV) {
            idxV += direction;
        }
        if (idxV >= this.schema.spelers.length) {
            idxV = 0;
            if (idxH == idxV) {
                idxV += direction;
            }
        }
        else if (idxV < 0) {
            idxV = this.schema.spelers.length - 1;
            if (idxH == idxV) {
                idxV += direction;
            }
        }
        this.idxSpl = idxV;
        this.idxTeg = idxH;
        this.setEscapeCount(1);
    }

    createRondeSchema(rondeIdx: number): CmpSchemaRonde {
        this.sortTotalen(rondeIdx + 1);
        let result = new CmpSchemaRonde();
        this.totalen.forEach(totSpl => {
            let speler = new CmpSchemaSpeler();
            speler.splId = totSpl.speler.splId;
            speler.splInits = totSpl.speler.splInit;
            speler.splBordnaam = totSpl.speler.splBordnaam;
            this.totalen.forEach(totTeg => {
                let wed = new CmpSchemaWedstrijd();
                wed.tegId = totTeg.speler.splId;
                wed.tegInits = totTeg.speler.splInit;
                wed.tegBordNaam = totTeg.speler.splBordnaam;
                let splWed = totSpl.speler.splRondes[rondeIdx].wedstrijden.find(w => w.tegId == totTeg.speler.splId);
                if (splWed) {
                    let tegWed = totTeg.speler.splRondes[rondeIdx].wedstrijden.find(w => w.tegId == totSpl.speler.splId);
                    if (tegWed) {
                        wed.gespeeld = true;
                        wed.wedOver = splWed.wedOver;
                        wed.metWit = splWed.metWit;
                        wed.punten = splWed.aantPnt;
                        if (wed.wedOver) {
                            wed.winst = (splWed.aantPnt > tegWed.aantPnt) ? 2 : (splWed.aantPnt == tegWed.aantPnt) ? 1 : 0;
                        }
                    }
                    else {
                        this.alert.showError('Vreemd! Wedstrijd niet gevonden : ' + totSpl.speler.splId + ' - ' + totTeg.speler.splId);
                    }
                }
                speler.splWeds.push(wed);
            });
            result.spelers.push(speler);
        });
        console.log(result);
        return result;
    }

    createRondeSchemaOud(ronde: number): CmpSchemaRonde {
        let result = new CmpSchemaRonde();
        this.competitie.cmpSpelers.forEach(spl => {
            let speler = new CmpSchemaSpeler();
            speler.splId = spl.splId;
            speler.splInits = spl.splInit;
            speler.splBordnaam = spl.splBordnaam;
            this.competitie.cmpSpelers.forEach(teg => {
                let wed = new CmpSchemaWedstrijd();
                wed.tegId = teg.splId;
                wed.tegInits = teg.splInit;
                wed.tegBordNaam = teg.splBordnaam;
                let splWed = spl.splRondes[ronde].wedstrijden.find(w => w.tegId == teg.splId);
                if (splWed) {
                    let tegWed = teg.splRondes[ronde].wedstrijden.find(w => w.tegId == spl.splId);
                    if (tegWed) {
                        wed.gespeeld = true;
                        wed.wedOver = splWed.wedOver;
                        wed.metWit = splWed.metWit;
                        wed.punten = splWed.aantPnt;
                        if (wed.wedOver) {
                            wed.winst = (splWed.aantPnt > tegWed.aantPnt) ? 2 : (splWed.aantPnt == tegWed.aantPnt) ? 1 : 0;
                        }
                    }
                    else {
                        this.alert.showError('Vreemd! Wedstrijd niet gevonden : ' + spl.splId + ' - ' + teg.splId);
                    }
                }
                speler.splWeds.push(wed);
            });
            result.spelers.push(speler);
        });
        console.log(result);
        return result;
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
    }

    private sortTotalen(nr: number) {
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

    createRaster(): Raster {
        let result = new Raster();
        const aantSpl = this.competitie.cmpSpelers.length
        for (let i = 0; i < aantSpl; i++) {
            result.arr.push(i);
        }
        result.cssScale = 'scale110';
        if (aantSpl > 4) {
            result.cssScale = 'scale120';
        }
        if (aantSpl > 9) {
            result.cssScale = 'scale125';
        }
        const fontTabel = [0, 0, 0, 3, 3, 3, 2.5, 2.25, 2, 1.75, 1.75, 1.625, 1.5, 1.375, 1.3, 1.25];
        if (aantSpl > 2) {
            const aant = aantSpl - 2;
            result.fontsize -= (aant * fontTabel[aantSpl]);
        }
        result.cellh = Math.floor(202 / (aantSpl + 1));
        result.topCellh = 202 - (result.cellh * aantSpl);
        result.cellw = Math.floor(464 / (aantSpl + 1));
        result.leftCellw = 464 - (result.cellw * aantSpl);
        console.log(result);
        return result;
    }

    setEscapeCount(nr: number) {
        this.escapeCount = nr;
    }

}
