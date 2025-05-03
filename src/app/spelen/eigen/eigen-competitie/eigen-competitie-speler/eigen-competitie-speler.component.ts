import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/button-group/button/button.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { CmpSpeler, CmpSplWedstrijd, Competitie } from '../../../../model/competitie';
import { Button } from '../../../../model/button';

@Component({
    selector: 'app-eigen-competitie-speler',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ButtonComponent,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './eigen-competitie-speler.component.html',
    styleUrl: './eigen-competitie-speler.component.css'
})
export class EigenCompetitieSpelerComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    title: string = '';
    subtitles: string[] = [];
    competitie: Competitie = new Competitie('');
    speler: CmpSpeler = new CmpSpeler(1);
    spelerWeds: CmpSplWedstrijd[] = [];
    idxWed: number = -1;
    idxRonde: number = -1;
    rondeButtons: Button[] = [];
    wedButton: Button = new Button('Enter', 'Naar wedstrijd', true);

    override escapePressed(): void {
        if (this.idxWed >= 0) {
            this.idxWed = -1;
            this.setEscapeCount();
            return;
        }
        if (this.idxRonde >= 0) {
            this.rondeButtonClicked(0);
            return;
        }
        this.appData.previousPage();
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            this.wedstrijdClicked(this.idxWed);
        }, 300);
    }

    rondeButtonClicked(rondeNr: number) {
        if (rondeNr > this.rondeButtons.length || rondeNr == (this.idxRonde + 1)) {
            return;
        }
        this.rondeButtons.forEach((btn, i) => {
            btn.selected = (i == rondeNr);
        });
        this.idxRonde = (rondeNr - 1);
        this.idxWed = -1;
        this.setEscapeCount();
        this.spelerWeds = this.fillWedstrijden();
    }

    wedstrijdClicked(idx: number) {
        this.idxWed = idx;
        const wed = this.spelerWeds[this.idxWed];
        const splId = wed.metWit ? this.speler.splId : wed.tegId;
        const tegId = wed.metWit ? wed.tegId : this.speler.splId;
        const rondeIdx = wed.ronde - 1;
        const idxSpl = this.competitie.cmpSpelers.findIndex(sp => sp.splId == splId);
        const idxTeg = this.competitie.cmpSpelers.findIndex(sp => sp.splId == tegId);
        const url = `eigencomps/${this.competitie.cmpNaam}/match/${rondeIdx}/${idxSpl}/${idxTeg}`;
        this.appData.gotoPage(this.router.url, url);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
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
        if (event.key ==='ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.selectNextWedstrijd(-1);
            }
            if (event.key === 'ArrowDown') {
                this.selectNextWedstrijd(1);
            }
            return false;
        }
        if (event.key === 'Enter') {
            if (this.idxWed >= 0) {
                this.buttonPressed(this.wedButton);
            }
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
        const splId: string | null = this.route.snapshot.paramMap.get('splId');
        if (!splId) {
            this.alert.showAlert('Het speler ID in de URL is niet geldig.', 'error');
            return;
        }
        const ronde: string | null = this.route.snapshot.paramMap.get('ronde');
        if (!ronde) {
            this.alert.showAlert('De ronde parameter in de URL is niet geldig.', 'error');
            return;
        }
        this.idxRonde = +ronde - 1;
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
            const idx = this.competitie.cmpSpelers.findIndex(spl => spl.splId == splId);
            if (idx < 0) {
                this.alert.showError(`Speler met ID '${splId}' niet gevonden in competitie.`);
                return;
            }
            this.speler = this.competitie.cmpSpelers[idx];
            this.spelerWeds = this.fillWedstrijden();
            
            if (this.competitie.cmpAantRondes < 2) {
                this.subtitles.push('');
            }
            else {
                for (let i = 0; i <= this.competitie.cmpAantRondes; i++) {
                    let txt = i == 0 ? ' - totaal' : ' - ronde ' + i;
                    this.subtitles.push(txt);
                    this.rondeButtons.push(new Button('' + i, '', false, true));
                }
                this.rondeButtons[this.idxRonde + 1].selected = true;
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private fillWedstrijden(): CmpSplWedstrijd[] {
        let result: CmpSplWedstrijd[] = [];
        if (this.idxRonde == -1) {
            this.speler.splRondes.forEach((rnd, idx) => {
                rnd.wedstrijden.forEach(wed => {
                    wed.ronde = idx + 1;
                    result.push(wed);
                });
            });
        }
        else {
            this.speler.splRondes[this.idxRonde].wedstrijden.forEach(wed => {
                wed.ronde = this.idxRonde + 1;
                result.push(wed);
            });
        }
        result.sort((a, b) => {
            return (a.datum > b.datum) ? 1 : -1;
        });
        return result;
    }

    private selectNextWedstrijd(direction: number) {
        if (this.spelerWeds.length == 0) {
            return;
        }
        let idx = this.idxWed;
        idx = idx + direction;
        if (idx < 0) {
            idx = this.spelerWeds.length - 1;
        }
        else if (idx >= this.spelerWeds.length) {
            idx = 0;
        }
        this.idxWed = idx;
    }

    private selectNextRonde(direction: number) {
        if (this.competitie.cmpAantRondes < 2) {
            return;
        }
        let idx = this.idxRonde;
        idx = idx + direction;
        if (idx < 0) {
            idx = this.competitie.cmpAantRondes - 1;
        }
        else if (idx >= this.competitie.cmpAantRondes) {
            idx = 0;
        }
        this.rondeButtonClicked(idx + 1);
    }

    private setEscapeCount() {
        this.escapeCount = this.idxRonde == -1 ? 0 : 1;
        if (this.idxWed >= 0) {
            this.escapeCount++;
        }
    }

}
