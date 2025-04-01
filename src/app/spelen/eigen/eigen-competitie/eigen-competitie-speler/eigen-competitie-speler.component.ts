import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { ButtonComponent } from '../../../../shared/button-group/button/button.component';
import { DecimalPipe, NgClass } from '@angular/common';
import { BaseComponent } from '../../../../base/base.component';
import { ActivatedRoute } from '@angular/router';
import { CmpSpeler, Competitie } from '../../../../model/competitie';
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
    idxRonde: number = 0;
    rondeButtons: Button[] = [];

    override escapePressed(): void {
        this.router.navigate(['eigencomps/' + this.competitie.cmpNaam]);
    }

    rondeButtonClicked(rondeNr: number) {
        if (rondeNr > this.rondeButtons.length) {
            return;
        }
        this.rondeButtons.forEach((btn, i) => {
            btn.selected = (i == (rondeNr - 1));
        });
        this.idxRonde = (rondeNr - 1);
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
            const idx = this.competitie.cmpSpelers.findIndex(spl => spl.splId == splId);
            if (idx < 0) {
                this.alert.showError(`Speler met ID '${splId}' niet gevonden in competitie.`);
                return;
            }
            this.speler = this.competitie.cmpSpelers[idx];
            this.speler.splRondes.forEach(rnd => {
                rnd.wedstrijden.sort((a, b) => {
                    return (a.datum > b.datum) ? 1 : -1;
                });
            });
            
            if (this.competitie.cmpAantRondes < 2) {
                this.subtitles.push('');
            }
            else {
                for (let i = 0; i < this.competitie.cmpAantRondes; i++) {
                    let txt = ' - ronde ' + (i + 1);
                    this.subtitles.push(txt);
                    this.rondeButtons.push(new Button('' + (i + 1), '', false, true));
                }
                this.rondeButtons[this.idxRonde].selected = true;
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private selectNextRonde(direction: number) {
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

}
