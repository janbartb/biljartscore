import { Button } from "./button";
import { CmpMatchSpeler } from "./competitie";
import { MatchSpeler } from "./match";
import { SpelerWrapper } from "./speler";
import { OefWedSpeler } from "./oef-wedstrijd";

export class ConfirmDialog {
    id: string = '';
    actie: string = '';
    inhoud: Alinea[] = [];

    acceptButton: Button = new Button('Enter', 'Ja', true);
    rejectButton: Button = new Button('Esc', 'Nee', true);

    constructor(act: string, inh: Alinea[], id?: string) {
        this.actie = act;
        this.inhoud = inh;
        this.id = id ? id : 'dialog';
    }
}

export class Alinea {
    regels: string[] = [];

    constructor(regels: string[]) {
        this.regels = regels;
    }
}

export class ConfirmSplBordNaamDialog {
    speler!: SpelerWrapper;
    naam: string = '';
    existingNames: string[] = [];

    acceptButton: Button = new Button('Enter', 'Ja', true);
    rejectButton: Button = new Button('Esc', 'Nee', true);

    constructor(spl: SpelerWrapper, existing: string[]) {
        this.speler = spl;
        this.naam = spl.speler.bordnaam;
        this.existingNames = existing;
    }
}

export class ConfirmEndOfMatchDialog {
    acceptButton: Button = new Button('Enter', 'Ja', true);
    rejectButton: Button = new Button('Esc', 'Nee', true);
}

export class SpelerNamenDialog {
    spelers: SpelerNamen[] = [];
    selSpelerId: string = '';

    acceptButton: Button = new Button('Enter', 'Ja', true);
    rejectButton: Button = new Button('Esc', 'Nee', true);
}

export class SpelerNamen {
    splId: string = '';
    splNaam: string = '';
    splBordNaam: string = '';
    splSpreekNaam: string = '';

    constructor(speler: OefWedSpeler | MatchSpeler | null, cmpSpeler?: CmpMatchSpeler) {
        if (cmpSpeler) {
            this.splId = cmpSpeler.id;
            this.splNaam = cmpSpeler.naam;
            this.splBordNaam = cmpSpeler.bordNaam;
            this.splSpreekNaam = cmpSpeler.spreekNaam;    
        }
        else if (speler) {
            this.splId = speler.splId;
            this.splNaam = speler.splNaam;
            this.splBordNaam = speler.splBordNaam;
            this.splSpreekNaam = speler.splSpreekNaam;    
        }
    }
}
