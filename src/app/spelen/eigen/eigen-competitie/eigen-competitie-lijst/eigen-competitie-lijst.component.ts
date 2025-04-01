import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../../base/base.component';
import { EigenCompetitieLijstSpelerComponent } from './eigen-competitie-lijst-speler/eigen-competitie-lijst-speler.component';
import { CmpMatchSpeler, CmpSpeler, Competitie, CompetitieMatch } from '../../../../model/competitie';
import { LijstDimensies, ScoreBeurt, ScoreSpeler } from '../../../../model/score-beurt';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../../../services/helper.service';

@Component({
    selector: 'app-eigen-competitie-lijst',
    standalone: true,
    imports: [
        EigenCompetitieLijstSpelerComponent
    ],
    templateUrl: './eigen-competitie-lijst.component.html',
    styleUrl: './eigen-competitie-lijst.component.css'
})
export class EigenCompetitieLijstComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);
    match: CompetitieMatch = new CompetitieMatch();
    spelerLijsten: ScoreSpeler[] = [new ScoreSpeler(), new ScoreSpeler()];
    prevUrl: string = '';
    idxRonde: number = -1;
    idxSpl: number = -1;
    idxTeg: number = -1;
    dataReady: boolean = false;
    dim: LijstDimensies = new LijstDimensies();

    override escapePressed(): void {
        this.router.navigate([this.prevUrl]);
    }

    fillScoreLijsten(): void {
        this.dim.maxBrt = 100;
        if (this.match.regels.idxOptie == 1) {
            this.dim.maxBrt = this.match.regels.vastAantBrt;
        }
        else {
            if (this.match.regels.maxBeurten > 0) {
                this.dim.maxBrt = this.match.regels.maxBeurten;
            }
        }
        this.bepaalDimensies();
        const cmpSpl = this.match.spelers[0];
        const cmpTeg = this.match.spelers[1];
        this.fillScoreLijst(cmpSpl, cmpTeg);
        this.fillScoreLijst(cmpTeg, cmpSpl);
    }

    private fillScoreLijst(spl: CmpMatchSpeler, teg: CmpMatchSpeler) {
        let scoreSpeler = new ScoreSpeler();
        scoreSpeler.naam = spl.bordNaam;
        scoreSpeler.tsCar = this.match.regels.idxOptie == 1 ? 0 : this.match.regels.idxOptie == 2 ? this.match.regels.vastAantCar : spl.tsCar;
        scoreSpeler.dim = this.dim;
        const idxLijst = spl.metWit ? 0 : 1;
        let totaal = 0;
        for (let i = 0; i < this.dim.totBrt; i++) {
            let item = new ScoreBeurt();
            if (i < spl.stand.score.length) {
                item.gespeeld = true;
                item.serie = spl.stand.score[i];
                totaal += item.serie;
                item.totaal = totaal;
            }
            else {
                item.verberg = i >= this.dim.maxBrt;
            }
            scoreSpeler.scores.push(item);
        }
        this.spelerLijsten[idxLijst] = scoreSpeler;    
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Escape' || event.key === 'Backspace') {
            event.stopPropagation();
            this.escapePressed();
            return false;
        }
        return false;
    }

    ngOnInit(): void {
        const naam: string | null = this.route.snapshot.paramMap.get('naam');
        if (!naam) {
            this.alert.showAlert('De competitienaam in de URL is niet geldig.', 'error');
            return;
        }
        const ronde: string | null = this.route.snapshot.paramMap.get('ronde');
        this.idxRonde = (ronde && this.helper.isValidIntegerOrZero(ronde)) ? +ronde : -1;
        const idxS: string | null = this.route.snapshot.paramMap.get('idxspl');
        this.idxSpl = (idxS && this.helper.isValidIntegerOrZero(idxS)) ? +idxS : -1;
        const idxT: string | null = this.route.snapshot.paramMap.get('idxteg');
        this.idxTeg = (idxT && this.helper.isValidIntegerOrZero(idxT)) ? +idxT : -1;
        if (this.idxRonde < 0 || this.idxSpl < 0 || this.idxTeg < 0 || this.idxSpl == this.idxTeg) {
            this.alert.showAlert('De match parameters in de URL zijn niet geldig.', 'error');
            return;
        }
        this.prevUrl = this.router.url.replace('lijst', 'match');
        Promise.all([
            this.bssApi.getCompetitie(naam),
            this.bssApi.getEigenMatch()
        ])
        .then(results => {
            let comp = new Competitie('');
            if (results[0].gevonden) {
                comp = results[0].comp;
            }
            else {
                this.alert.showError(`Competitiebestand '${naam}.json' niet gevonden.`);
                return;
            }
            let createdMatch = this.createMatchFromComp(comp);
            if (createdMatch.matchOver) {
                this.match = createdMatch;
            }
            else {
                if (results[1].gevonden) {
                    this.match = results[1].match;
                    if (this.match.cmpRonde != createdMatch.cmpRonde ||
                            this.match.spelers[0].id != createdMatch.spelers[0].id || 
                            this.match.spelers[1].id != createdMatch.spelers[1].id) {
                        this.match = createdMatch;
                    }
                }
            }

            this.fillScoreLijsten();
            this.dataReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private bepaalDimensies() {
        this.dim.pageRows = 30;
        this.dim.rowHeight = 1;
        this.dim.fontSize = .75;
        if (this.dim.maxBrt <= 30) {
            this.dim.totBrt = 30;
            this.dim.pages = [0];
        }
        else if (this.dim.maxBrt <= 60) {
            this.dim.totBrt = 60;
            this.dim.pages = [0, 1];
        }
        else if (this.dim.maxBrt <= 90) {
            this.dim.totBrt = 90;
            this.dim.pages = [0, 1, 2];
        }
        else {
            this.dim.totBrt = 120;
            this.dim.pages = [0, 1, 2, 3];
        }
    }

    private createMatchFromComp(comp: Competitie): CompetitieMatch {
        let result = new CompetitieMatch();
        const spl = comp.cmpSpelers[this.idxSpl];
        const teg = comp.cmpSpelers[this.idxTeg];
        const splWed = spl.splRondes[this.idxRonde].wedstrijden.find(wed => wed.tegId == teg.splId);
        const tegWed = teg.splRondes[this.idxRonde].wedstrijden.find(wed => wed.tegId == spl.splId);
        result.datum = new Date().toISOString().substring(0, 10);
        result.cmpNaam = comp.cmpNaam;
        result.cmpRonde = this.idxRonde + 1;
        result.regels = comp.cmpRegels;
        result.telling = comp.cmpTelling;
        let matchSpl = new CmpMatchSpeler(spl, true);
        let matchTeg = new CmpMatchSpeler(teg, false);
        if (splWed && tegWed) {
            result.matchOver = true;
            result.datum = splWed.datum;
            // speler stand
            matchSpl.metWit = splWed.metWit;
            matchSpl.stand.aantCar = splWed.aantCar;
            matchSpl.stand.aantBrt = splWed.aantBrt;
            matchSpl.stand.gemiddelde = splWed.aantCar / splWed.aantBrt;
            matchSpl.stand.hoogSer = splWed.hoogSer;
            matchSpl.stand.punten = splWed.aantPnt;
            matchSpl.stand.score = splWed.scores;
            // tegenstander stand
            matchTeg.metWit = tegWed.metWit;
            matchTeg.stand.aantCar = tegWed.aantCar;
            matchTeg.stand.aantBrt = tegWed.aantBrt;
            matchTeg.stand.gemiddelde = tegWed.aantCar / splWed.aantBrt;
            matchTeg.stand.hoogSer = tegWed.hoogSer;
            matchTeg.stand.punten = tegWed.aantPnt;
            matchTeg.stand.score = tegWed.scores;
        }
        else {
            result.matchOver = false;
            result.datum = '';            
        }
        if (matchSpl.metWit) {
            result.spelers.push(matchSpl);
            result.spelers.push(matchTeg);
        }
        else {
            result.spelers.push(matchTeg);
            result.spelers.push(matchSpl);
        }
        return result;
    }

}
