import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { Competitie } from '../../../../model/competitie';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/page-header/page-header.component';
import { SectionHeaderComponent } from '../../../../shared/section-header/section-header.component';
import { NgClass } from '@angular/common';
import { Button } from '../../../../model/button';
import { ButtonComponent } from '../../../../shared/button-group/button/button.component';
import { SectionFooterBtnsComponent } from '../../../../shared/section-footer-btns/section-footer-btns.component';

class Planning {
    datum: string = '';
    aantWed: number = 0;
    spelers: PlanSpeler[] = [];
    wedstrijden: PlanWedstrijd[] = [];

    constructor() {
        this.datum = new Date().toISOString().substring(0, 10);
    }
}

class PlanSpeler {
    id: string = '';
    naam: string = '';
    aantWed: number = 0;
    dagenGeleden: number = 999;
    laatsteDat: string = '';
    aanwezig: boolean = true;
    ingepland: boolean = false;
    mogelijkeTegs: string[] = [];
}

class PlanWedstrijd {
    ronde: number = 0;
    splId: string = '';
    splNaam: string = '';
    tegId: string = '';
    tegNaam: string = '';
    gespeeld: boolean = false;
}

class MogelijkeWed {
    ronde: number = 0;
    splId: string = '';
    tegId: string = '';

    constructor(rnd: number, spl: string, teg: string) {
        this.ronde = rnd;
        this.splId = spl;
        this.tegId = teg;
    }
}

@Component({
    selector: 'app-eigen-competitie-planning',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './eigen-competitie-planning.component.html',
    styleUrl: './eigen-competitie-planning.component.css'
})
export class EigenCompetitiePlanningComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    title: string = '';
    subtitle: string = 'Planning';
    comp: Competitie = new Competitie('');
    rondeIdx: number = 0;
    spelerIdx: number = -1;
    planning: Planning = new Planning();
    idxActiveSection: number = 0;
    idxWed: number = -1;
    aantGeplandeWed: number = 0;
    maxAantTePlannenWed: number = 0;
    plannenWasClicked: boolean = false;
    wedButtons: Button[] = [];
    planButtons: Button[] = [
        new Button('Enter', 'Plan wedstrijden', true),
        new Button('Enter', 'Naar wedstrijd', true)
    ];

    override escapePressed(): void {
        if (this.escapeCount > 0) {
            this.spelerIdx = -1;
            this.idxWed = -1;
            this.idxActiveSection = 0;
            this.setEscapeCount();
            return;
        }
        this.appData.previousPage();
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                const idxBtn = this.idxWed >= 0 ? 1 : 0;
                this.buttonClicked(idxBtn);
            }
        }, 300);
    }

    spacePressed() {
        if (this.idxActiveSection != 0 || this.spelerIdx < 0 || this.spelerIdx >= this.planning.spelers.length) {
            return;
        }
        this.spelerClicked(this.spelerIdx);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.plannenClicked();
        }
        else {
            this.wedstrijdClicked(this.idxWed);
        }
    }

    wedstrijdClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        const wed = this.planning.wedstrijden[idx];
        const idxRonde = wed.ronde - 1;
        const idxSpl = this.comp.cmpSpelers.findIndex(spl => spl.splId == wed.splId);
        const idxTeg = this.comp.cmpSpelers.findIndex(spl => spl.splId == wed.tegId);
        const toUrl = `eigencomps/${this.comp.cmpNaam}/match/${idxRonde}/${idxSpl}/${idxTeg}`;
        this.appData.gotoPage(this.router.url, toUrl);
    }

    spelerClicked(idx: number) {
        this.idxActiveSection = 0;
        this.idxWed = -1;
        if (idx < 0 || idx >= this.planning.spelers.length) {
            return;
        }
        this.planning.spelers[idx].aanwezig = !this.planning.spelers[idx].aanwezig;
        this.planning.aantWed = 0;
        this.bepaalAantalTePlannenWedstrijden();
        this.planning.wedstrijden = [];
        this.plannenWasClicked = false;
    }

    aantWedClicked(aant: number) {
        this.idxActiveSection = 0;
        this.idxWed = -1;
        this.planning.aantWed = aant;
        this.wedButtons.forEach(btn => btn.selected = btn.key == ('' + aant));
        this.planning.wedstrijden = [];
        this.plannenWasClicked = false;
    }

    activateSection(idx: number) {
        if (idx == this.idxActiveSection) {
            if (idx == 0) {
                this.planning.spelers = this.aanmakenVolgordeLijst();
                this.clearPlanning();
                this.bepaalAantalTePlannenWedstrijden();
            }
            return;
        }
        this.idxActiveSection = idx;
        if (idx == 0) {
            this.idxWed = -1;
        }
        if (idx == 1) {
            this.spelerIdx = -1;
        }
        this.setEscapeCount();
    }

    switchActiveSection() {
        const idx = this.idxActiveSection == 0 ? 1 : 0;
        this.activateSection(idx);
    }

    private clearPlanning() {
        this.planning.wedstrijden = [];
        this.aantGeplandeWed = 0;
        this.planning.spelers.forEach(spl => {
            spl.ingepland = false;
        });
    }

    plannenClicked() {
        localStorage.removeItem('planning');
        this.startPlannen();
        if (this.planning.wedstrijden.length > 0) {
            this.planning.wedstrijden.forEach(wed => {
                if ((wed.ronde == 1 && wed.splNaam > wed.tegNaam) || (wed.ronde == 2 && wed.splNaam < wed.tegNaam)) {
                    this.wisselSpelers(wed);
                }
            });
            this.idxActiveSection = 1;
            localStorage.setItem('planning', JSON.stringify(this.planning));
        }
    }

    startPlannen() {
        this.plannenWasClicked = true;
        this.clearPlanning();
        this.planning.datum = new Date().toISOString().substring(0, 10);
        let aantTePlannenWed = this.planning.aantWed;
        let rondesTePlannen = 1;
        let aanwezigeSpelers = this.getAanwezigeSpelers();
        let aantTePlannenSpl = aantTePlannenWed * 2;
        let resultaat: MogelijkeWed[] = [];
        let klaar = false;
        while (!klaar) {
            let tePlannenSpelers = aanwezigeSpelers.slice(0, aantTePlannenSpl);
            let weds = this.planWedstrijden(rondesTePlannen, aantTePlannenWed, aantTePlannenSpl, tePlannenSpelers);
            klaar = weds.length == aantTePlannenWed;
            if (!klaar) {
                aantTePlannenSpl++;
                if (aantTePlannenSpl > aanwezigeSpelers.length) {
                    rondesTePlannen++;
                    aantTePlannenSpl = aantTePlannenWed * 2;
                    if (rondesTePlannen > this.comp.cmpAantRondes) {
                        rondesTePlannen = 1;
                        aantTePlannenWed--;
                        if (aantTePlannenWed == 0) {
                            klaar = true;
                            weds = [];
                        }
                        else {
                            aantTePlannenSpl = aantTePlannenWed * 2;
                        }                        
                    }
                }
            }
            if (klaar) {
                resultaat = weds;
            }
        }
        if (resultaat.length > 0) {
            this.planning.wedstrijden = this.createGeplandeWedstrijden(resultaat);
        }
    }

    planWedstrijden(aantRondes: number, aantWed: number, aantSpl: number, tePlannenSpl: PlanSpeler[]): MogelijkeWed[] {
        let result: MogelijkeWed[] = [];
        let alleMogelijkeWeds = this.getAlleMogelijkeWedstrijden(aantRondes, tePlannenSpl);
        console.log(alleMogelijkeWeds);
        if (alleMogelijkeWeds.length < aantWed) {
            return result;
        }
        let mogelijkeWeds = alleMogelijkeWeds.slice(0);
        let idxStart = 0;
        let firstSplId = mogelijkeWeds[idxStart].splId;
        let klaar = false;
        while (!klaar) {
            result = this.getGeplandeWedstrijden(mogelijkeWeds, aantWed, firstSplId);
            if (result.length == aantWed) {
                klaar = true;
            }
            else {
                idxStart++;
                if (idxStart >= mogelijkeWeds.length) {
                    klaar = true;
                }
                else {
                    mogelijkeWeds = alleMogelijkeWeds.slice(idxStart);
                    if (mogelijkeWeds[0].splId != firstSplId) {
                        klaar = true;
                    }
                }
            }
        }
        return result;
    }

    getGeplandeWedstrijden(mogelijkeWeds: MogelijkeWed[], aantWed: number, firstSplId: string): MogelijkeWed[] {
        let result: MogelijkeWed[] = [];
        const wed = mogelijkeWeds[0];
        result.push(wed);
        let wedsMogelijk = mogelijkeWeds.filter(w => w.splId != wed.splId && w.splId != wed.tegId && w.tegId != wed.splId && w.tegId != wed.tegId);
        if (wedsMogelijk.length == 0) {
            return result;
        }
        let idxStart = 0;
        let firstId = wedsMogelijk[idxStart].splId;
        let nrOfWed = aantWed - 1;
        if (nrOfWed == 0) {
            return result;
        }
        let weds: MogelijkeWed[] = [];
        let klaar = false;
        while (!klaar) {
            weds = this.getGeplandeWedstrijden(wedsMogelijk, nrOfWed, firstId);
            if (weds.length == nrOfWed) {
                klaar = true;
            }
            else {
                idxStart++;
                if (idxStart >= wedsMogelijk.length) {
                    klaar = true;
                }
                else {
                    wedsMogelijk = wedsMogelijk.slice(idxStart);
                    if (wedsMogelijk[0].splId != firstId) {
                        klaar = true;
                    }
                }
            }
        }
        return result.concat(weds);
    }

    getAlleMogelijkeWedstrijden(aantRondes: number, tePlannenSpl: PlanSpeler[]): MogelijkeWed[] {
        let result: MogelijkeWed[] = [];
        tePlannenSpl.forEach((spl, idx) => {
            const compSpl = this.comp.cmpSpelers.find(cs => cs.splId == spl.id);
            if (compSpl) {
                let mogelijkeTegs: PlanSpeler[] = tePlannenSpl.slice(idx + 1);
                for (let idxRonde = 0; idxRonde < aantRondes; idxRonde++) {
                    mogelijkeTegs.forEach(teg => {
                        const gespeeld = compSpl.splRondes[idxRonde].wedstrijden.some(wed => wed.tegId == teg.id);
                        if (!gespeeld) {
                            const alAanwezig = result.some(wed => wed.splId == spl.id && wed.tegId == teg.id);
                            if (!alAanwezig) {
                                result.push(new MogelijkeWed(idxRonde + 1, spl.id, teg.id));
                            }
                        }
                    });
                }
            }
        });
        return result;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return true;
        }
        if (event.key ==='ArrowLeft' || event.key === 'ArrowRight') {
            this.switchActiveSection();
            return false;
        }    
        if (event.key ==='ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                if (this.idxActiveSection == 0) {
                    this.changeSpeler(-1);
                }
                else {
                    this.changeWedstrijd(-1);
                }
            }
            if (event.key === 'ArrowDown') {
                if (this.idxActiveSection == 0) {
                    this.changeSpeler(1);
                }
                else {
                    this.changeWedstrijd(1);
                }
            }
            this.setEscapeCount();
            return false;
        }    
        if (event.key == 'Enter') {
            this.buttonPressed(this.planButtons[0]);
            return false;
        }
        if (event.code == 'Space') {
            this.spacePressed();
            return false;
        }
        if (event.code.startsWith('Digit')) {
            const digit = +event.code.substring(5);
            if (digit > 0 && digit <= this.wedButtons.length) {
                this.aantWedClicked(digit);
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
        this.rondeIdx = +ronde;
        this.bssApi.getCompetitie(naam)
        .then(resp => {
            if (!resp.gevonden) {
                this.alert.showError(`Competitiebestand '${naam}.json' niet gevonden.`);
                return;
            }
            this.comp = resp.comp;
            this.title = `Competitie '${this.comp.cmpNaam}'`;
            this.planning.spelers = this.aanmakenVolgordeLijst();
            this.bepaalAantalTePlannenWedstrijden();
            let oldPlanning = localStorage.getItem('planning');
            if (oldPlanning) {
                const plan: Planning = JSON.parse(oldPlanning);
                const aantDagen = this.getAantalDagenGeleden(plan.datum);
                if (aantDagen < 2) {
                    this.planning = plan;
                    this.bepaalAantalTePlannenWedstrijden();
                    this.planning.wedstrijden.forEach(wed => {
                        let spl = this.comp.cmpSpelers.find(sp => sp.splId == wed.splId);
                        if (spl) {
                            let teg = spl.splRondes[wed.ronde - 1].wedstrijden.find(wd => wd.tegId == wed.tegId);
                            if (teg) {
                                wed.gespeeld = true;
                            }
                        }
                    });
                }
            } 
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private createGeplandeWedstrijden(weds: MogelijkeWed[]): PlanWedstrijd[] {
        let result: PlanWedstrijd[] = [];
        weds.forEach(wed => {
            let planWed = new PlanWedstrijd();
            Object.assign(planWed, wed);
            planWed.splNaam = this.getSpelerNaam(wed.splId);
            planWed.tegNaam = this.getSpelerNaam(wed.tegId);
            result.push(planWed);
        });
        return result;
    }

    private wisselSpelers(wed: PlanWedstrijd) {
        const tempId = wed.splId;
        const tempNaam = wed.splNaam;
        wed.splId = wed.tegId;
        wed.splNaam = wed.tegNaam;
        wed.tegId = tempId;
        wed.tegNaam = tempNaam;
    }

    private changeSpeler(direction: number) {
        if (this.planning.spelers.length == 0) {
            return;
        }
        let idx = this.spelerIdx;
        idx += direction;
        if (idx < 0) {
            idx = this.planning.spelers.length - 1;
        }
        if (idx >= this.planning.spelers.length) {
            idx = 0;
        }
        this.spelerIdx = idx;
    }

    private changeWedstrijd(direction: number) {
        if (this.planning.wedstrijden.length == 0) {
            return;
        }
        let idx = this.idxWed;
        idx += direction;
        if (idx < 0) {
            idx = this.planning.wedstrijden.length - 1;
        }
        if (idx >= this.planning.wedstrijden.length) {
            idx = 0;
        }
        this.idxWed = idx;
    }

    private getAanwezigeSpelers(): PlanSpeler[] {
        return this.planning.spelers.filter(spl => spl.aanwezig);
    }

    private bepaalAantalTePlannenWedstrijden() {
        this.wedButtons = [];
        this.maxAantTePlannenWed = Math.floor(this.getAanwezigeSpelers().length / 2);
        if (this.maxAantTePlannenWed >= 1) {
            for (let i = 0; i < this.maxAantTePlannenWed; i++) {
                this.wedButtons.push(new Button('' + (i + 1), '', true, true));
            }
            if (this.planning.aantWed > 0) {
                this.wedButtons[this.planning.aantWed - 1].selected = true;
            }
            else {
                this.wedButtons[this.maxAantTePlannenWed - 1].selected = true;
                this.planning.aantWed = this.maxAantTePlannenWed;
            }
        }
    }

    private aanmakenVolgordeLijst(): PlanSpeler[] {
        let result: PlanSpeler[] = [];
        this.comp.cmpSpelers.forEach(spl => {
            let speler: PlanSpeler = new PlanSpeler();
            speler.id = spl.splId;
            speler.naam = spl.splBordnaam;
            let aantWed = 0;
            let laatsteDat = '';
            spl.splRondes.forEach(ronde => {
                ronde.wedstrijden.forEach(wed => {
                    aantWed++;
                    if (wed.datum > laatsteDat) {
                        laatsteDat = wed.datum;
                    }
                });
            });
            speler.aantWed = aantWed;
            speler.laatsteDat = laatsteDat;
            speler.dagenGeleden = this.getAantalDagenGeleden(laatsteDat);
            result.push(speler);
        });
        result.sort(this.comparePlanSpelers);
        return result;
    }

    private comparePlanSpelers(a: PlanSpeler, b: PlanSpeler): number {
        if (a.dagenGeleden < 2 && b.dagenGeleden >= 2) {
            return 1;
        }
        if (a.dagenGeleden >= 2 && b.dagenGeleden < 2) {
            return -1;
        }
        if (a.aantWed == b.aantWed) {
            if (a.dagenGeleden == b.dagenGeleden) {
                return a.naam > b.naam ? 1 : -1;
            }
            else {
                return b.dagenGeleden - a.dagenGeleden;
            }
        }
        else {
            return a.aantWed - b.aantWed;
        }
    }

    private getAantalDagenGeleden(datum: string): number {
        if (datum == '') {
            datum = '2001-01-01';
        }
        const now = new Date().getTime();
        const datISO = datum + 'T12:00:00.000Z';
        const dat = new Date(datISO).getTime();
        const dagen = Math.round((now - dat) / 1000 / 3600 / 24);
        if (dagen > 99) {
            return 99;
        }
        return dagen;
    }

    private getSpelerNaam(id: string): string {
        let result = '';
        const spl = this.comp.cmpSpelers.find(s => s.splId == id);
        if (spl) {
            result = spl.splBordnaam;
        }
        return result;
    }

    private setEscapeCount() {
        this.escapeCount = (this.spelerIdx >= 0 || this.idxWed >= 0) ? 1 : 0;
    }

}
