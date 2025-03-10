import { Button } from "./button";
import { MatchSpeler } from "./match";
import { WedSpeler } from "./wedstrijd";

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

export class MatchSpelerDialog {
    speler: MatchSpeler = new MatchSpeler();
    actie: string = '';

    acceptButton: Button = new Button('Enter', 'Ja', true);
    rejectButton: Button = new Button('Esc', 'Nee', true);

    constructor(spl: MatchSpeler) {
        this.speler = spl;
    }
}

export class WedSpelerDialog {
    speler!: WedSpeler;
    actie: string = '';

    acceptButton: Button = new Button('Enter', 'Ja', true);
    rejectButton: Button = new Button('Esc', 'Nee', true);

    constructor(spl: WedSpeler) {
        this.speler = spl;
    }
}

export class Alinea {
    regels: string[] = [];

    constructor(regels: string[]) {
        this.regels = regels;
    }
}