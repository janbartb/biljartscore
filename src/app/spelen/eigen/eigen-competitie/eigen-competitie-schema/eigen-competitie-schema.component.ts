import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { CmpSchemaRonde, CmpSchemaSpeler, CmpSchemaWedstrijd, Competitie } from '../../../../model/competitie';
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
    raster: Raster = new Raster();
    idxRonde: number = 0;
    idxSpl: number = -1;
    idxTeg: number = -1;
    escapeCount: number = 0;

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
        this.router.navigate(['eigencomps/' + this.competitie.cmpNaam]);
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
        this.router.navigate([`eigencomps/${this.competitie.cmpNaam}/match/${this.idxRonde}/${this.idxSpl}/${this.idxTeg}`]);
    }

    planningClicked() {
        this.router.navigate([`eigencomps/${this.competitie.cmpNaam}/planning/${this.idxRonde}`]);
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

    createRondeSchema(ronde: number): CmpSchemaRonde {
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
