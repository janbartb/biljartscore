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

class GeplandeWedstrijden {
    datum: string = '';
    wedstrijden: PlanWedstrijd[] = [];

    constructor() {
        this.datum = new Date().toISOString().substring(0, 10);
    }
}

class PlanWedstrijd {
    ronde: number = 0;
    splId: string = '';
    splNaam: string = '';
    tegId: string = '';
    tegNaam: string = '';
    gespeeld: boolean = false;
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
    spelerLijst: PlanSpeler[] = [];
    spelerIdx: number = -1;
    wedstrijden: GeplandeWedstrijden = new GeplandeWedstrijden();
    aantGeplandeWed: number = 0;
    aantTePlannenWed: number = 0;
    maxAantTePlannenWed: number = 0;
    plannenWasClicked: boolean = false;
    wedButtons: Button[] = [];
    planButtons: Button[] = [
        new Button('Enter', 'Plan wedstrijden', true)
    ];
    escapeCount: number = 0;

    override escapePressed(): void {
        const naam = this.comp.cmpNaam;
        const ronde = this.rondeIdx;
        this.router.navigate([`eigencomps/${naam}/schema/${ronde}`]);
    }

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.plannenClicked();
            }
        }, 300);
    }

    wedstrijdClicked(idx: number) {
        const wed = this.wedstrijden.wedstrijden[idx];
        const idxRonde = wed.ronde - 1;
        const idxSpl = this.comp.cmpSpelers.findIndex(spl => spl.splId == wed.splId);
        const idxTeg = this.comp.cmpSpelers.findIndex(spl => spl.splId == wed.tegId);
        this.router.navigate([`eigencomps/${this.comp.cmpNaam}/match/${idxRonde}/${idxSpl}/${idxTeg}`]);
    }

    spelerClicked(idx: number) {
        if (idx < 0 || idx >= this.spelerLijst.length) {
            return;
        }
        this.spelerLijst[idx].aanwezig = !this.spelerLijst[idx].aanwezig;
        this.bepaalAantalTePlannenWedstrijden();
        this.wedstrijden.wedstrijden = [];
        this.plannenWasClicked = false;
    }

    aantWedClicked(aant: number) {
        this.aantTePlannenWed = aant;
        this.wedButtons.forEach(btn => btn.selected = btn.key == ('' + aant));
        this.wedstrijden.wedstrijden = [];
        this.plannenWasClicked = false;
    }

    private clearPlanning() {
        this.wedstrijden.wedstrijden = [];
        this.aantGeplandeWed = 0;
        this.spelerLijst.forEach(spl => {
            spl.ingepland = false;
        });
    }

    plannenClicked() {
        localStorage.removeItem('gepland');
        this.startPlannen();
        if (this.wedstrijden.wedstrijden.length > 0) {
            localStorage.setItem('gepland', JSON.stringify(this.wedstrijden));
        }
    }

    startPlannen() {
        this.plannenWasClicked = true;
        this.clearPlanning();
        let tePlannen = this.aantTePlannenWed;
         this.spelerLijst.forEach(spl => {
            spl.ingepland = false;
            spl.mogelijkeTegs = [];
        });
        for (let i = 0; i < this.comp.cmpAantRondes; i++) {
            let weds = this.getPlanningPerRonde(i, tePlannen, this.getAanwezigeSpelers());
            this.wedstrijden.wedstrijden.push(...weds);
            tePlannen = tePlannen - this.wedstrijden.wedstrijden.length;
        }
    }

    getPlanningPerRonde(idxRonde: number, tePlannen: number, aanwezigeSpelers: PlanSpeler[]): PlanWedstrijd[] {
        let weds: PlanWedstrijd[] = [];
        let aantSpelers = tePlannen * 2;
        let tempSpelers = aanwezigeSpelers.slice(0, aantSpelers);
        let spelers = this.getSpelerLijstPerRonde(idxRonde + 1, tempSpelers, this.wedstrijden.wedstrijden);
        let idxT = 0;
        let klaar = tePlannen <= 0 || spelers.length < 2;
        while (!klaar) {
            weds = this.getWedstrijden(idxRonde + 1, tePlannen, [], spelers, idxT);
            if (weds.length == tePlannen) {
                klaar = true;
            }
            else {
                idxT++;
                if (idxT >= spelers[0].mogelijkeTegs.length) {
                    aantSpelers++;
                    if (aantSpelers > this.spelerLijst.length) {
                        tePlannen--;
                        if (tePlannen == 0) {
                            klaar = true;
                        }
                        else {
                            idxT = 0;
                            aantSpelers = tePlannen * 2;
                            tempSpelers = this.spelerLijst.slice(0, aantSpelers);
                            spelers = this.getSpelerLijstPerRonde(idxRonde + 1, tempSpelers, this.wedstrijden.wedstrijden);
                        }
                    }
                    else {
                        idxT = 0;
                        tempSpelers = this.spelerLijst.slice(0, aantSpelers);
                        spelers = this.getSpelerLijstPerRonde(idxRonde + 1, tempSpelers, this.wedstrijden.wedstrijden);
                    }
                }
            }
        }
        return weds;
    }

    getWedstrijden(ronde: number, aantal: number, prevWeds: PlanWedstrijd[], prevSpelers: PlanSpeler[], idxTeg: number): PlanWedstrijd[] {
        if (aantal == 0 || prevSpelers.length < 2) {
            return prevWeds;
        }
        if (idxTeg >= prevSpelers[0].mogelijkeTegs.length) {
            return prevWeds;
        }
        let allWeds: PlanWedstrijd[] = JSON.parse(JSON.stringify(prevWeds));
        let spelers: PlanSpeler[] = JSON.parse(JSON.stringify(prevSpelers));
        let wed = this.getWedstrijd(ronde, spelers, idxTeg);
        allWeds.push(wed);
        spelers = this.getSpelerLijstPerRonde(ronde, spelers, allWeds);
        let tePlannen = aantal - 1;
        let idxT = 0;
        let klaar = tePlannen == 0 || spelers.length < 2;
        while (!klaar) {
            let weds = this.getWedstrijden(ronde, tePlannen, allWeds, spelers, idxT);
            if ((weds.length - allWeds.length) == tePlannen) {
                allWeds = weds;
                klaar = true;
            }
            else {
                idxT++;
                if (idxT >= spelers[0].mogelijkeTegs.length) {
                    klaar = true;
                }
            }
        }
        return allWeds;
    }

    private getWedstrijd(ronde: number, spelers: PlanSpeler[], idxTeg: number): PlanWedstrijd {
        let spl = spelers[0];
        const idx = spelers.findIndex(sp => sp.id == spl.mogelijkeTegs[idxTeg]);
        let teg = spelers[idx];
        let wed = new PlanWedstrijd();
        wed.ronde = ronde;
        wed.splId = spl.id;
        wed.splNaam = spl.naam;
        wed.tegId = teg.id;
        wed.tegNaam = teg.naam;
        spl.ingepland = true;
        teg.ingepland = true;
        return wed;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return true;
        }
        if (event.key ==='ArrowLeft' || event.key === 'ArrowRight') {
            if (event.key === 'ArrowLeft') {
                this.changeWedButton(-1);
            }
            if (event.key === 'ArrowRight') {
                this.changeWedButton(1);
            }
            return false;
        }    
        if (event.key ==='ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.changeSpeler(-1);
            }
            if (event.key === 'ArrowDown') {
                this.changeSpeler(1);
            }
            return false;
        }    
        if (event.key == 'Enter') {
            this.buttonPressed(this.planButtons[0]);
            return false;
        }
        if (event.code == 'Space') {
            this.spelerClicked(this.spelerIdx);
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
            this.spelerLijst = this.aanmakenVolgordeLijst();
            this.bepaalAantalTePlannenWedstrijden();
            let gepland = localStorage.getItem('gepland');
            if (gepland) {
                this.wedstrijden = JSON.parse(gepland);
                this.wedstrijden.wedstrijden.forEach(wed => {
                    let spl = this.comp.cmpSpelers.find(sp => sp.splId == wed.splId);
                    if (spl) {
                        let teg = spl.splRondes[wed.ronde - 1].wedstrijden.find(wd => wd.tegId == wed.tegId);
                        if (teg) {
                            wed.gespeeld = true;
                        }
                    }
                });
            } 
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private changeSpeler(direction: number) {
        let idx = this.spelerIdx;
        idx += direction;
        if (idx < 0) {
            idx = this.spelerLijst.length - 1;
        }
        if (idx >= this.spelerLijst.length) {
            idx = 0;
        }
        this.spelerIdx = idx;
    }

    private changeWedButton(direction: number) {
        let idx = this.wedButtons.findIndex(btn => btn.selected);
        idx += direction;
        if (idx < 0) {
            idx = this.wedButtons.length - 1;
        }
        if (idx >= this.wedButtons.length) {
            idx = 0;
        }
        this.aantWedClicked(idx + 1);
    }

    private getSpelerLijstPerRonde(ronde: number, spelers: PlanSpeler[], weds: PlanWedstrijd[]): PlanSpeler[] {
        if (spelers.length < 2) {
            return [];
        }
        const idxRonde = ronde - 1;
        let lijstSpelers: PlanSpeler[] = JSON.parse(JSON.stringify(spelers));
        let allWeds: PlanWedstrijd[] = JSON.parse(JSON.stringify(weds));
        allWeds.push(...this.wedstrijden.wedstrijden);
        lijstSpelers = lijstSpelers.filter(spl => spl.aanwezig && !spl.ingepland && !allWeds.some(wed => {
            return wed.splId == spl.id || wed.tegId == spl.id;
        }));
        if (spelers.length < 2) {
            return [];
        }
        lijstSpelers.forEach(spl => {
            spl.mogelijkeTegs = [];
            let compSpl = this.comp.cmpSpelers.find(s => s.splId == spl.id);
            if (compSpl) {
                let splRonde = compSpl.splRondes[idxRonde];
                lijstSpelers.forEach(teg => {
                    const gespeeld = teg.id == spl.id || splRonde.wedstrijden.some(wed => wed.tegId == teg.id);
                    if (!gespeeld) {
                        spl.mogelijkeTegs.push(teg.id);
                    }
                });
                if (spl.mogelijkeTegs.length == 0) {
                    spl.ingepland = true;
                }
            }
        });
        if (lijstSpelers.some(spl => spl.ingepland)) {
            return this.getSpelerLijstPerRonde(ronde, lijstSpelers, allWeds);
        }
        return lijstSpelers;
    }

    private getAanwezigeSpelers(): PlanSpeler[] {
        return this.spelerLijst.filter(spl => spl.aanwezig);
    }

    private bepaalAantalTePlannenWedstrijden() {
        this.wedButtons = [];
        this.maxAantTePlannenWed = Math.floor(this.getAanwezigeSpelers().length / 2);
        if (this.maxAantTePlannenWed >= 1) {
            for (let i = 0; i < this.maxAantTePlannenWed; i++) {
                this.wedButtons.push(new Button('' + (i + 1), '', true, true));
            }
            this.wedButtons[this.maxAantTePlannenWed - 1].selected = true;    
        }
        this.aantTePlannenWed = this.maxAantTePlannenWed;
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

}
