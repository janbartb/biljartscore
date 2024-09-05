export class Vereniging {
    id: string = '';
    knbbId: string = '';
    naam: string = '';
    korteNaam: string = '';
    locatie: string = '';
    plaats: string = '';
    teams: Team[] = []; 
    leden: Lid[] = [];
}

export class Team {
    id: string = '';
    naam: string = '';
    klasse: string = '';
    leden: string[] = [];
}

export class Lid {
    id: string = '';
    vnaam: string = '';
    anaam: string = '';
    tnaam: string = '';
    gemiddelde: number = 0;
}

export class VerenigingKort {
    id: string = '';
    naam: string = '';
    korteNaam: string = '';

    constructor(vereniging: Vereniging) {
        this.id = vereniging.id;
        this.naam = vereniging.naam;
        this.korteNaam = vereniging.korteNaam;
    }
}
