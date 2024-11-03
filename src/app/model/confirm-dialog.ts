import { Button } from "./button";

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