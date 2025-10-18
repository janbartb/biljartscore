import { Message, SpelerMessage } from "./message";

export class Wedstrijd {
    spel: string = 'standaard';
    aantSpelers: number = 2;
    regels: WedRegels = new WedRegels();
    telling: WedTelling = new WedTelling();
    opslaanInComp: boolean = false;
    wedOpgeslagen: boolean = false;
    wedGespeeld: boolean = false;
    spelers: WedSpeler[] = [];
    teams: WedTeam[] = [];
    message: Message = new Message();
}

export class WedRegels {
    /**
     * idxOptie :
     * 0 = aantal caramboles op basis van KNBB tabellen (klasse = <knbbKlasse>)
     * 1 = vast aantal beurten
     * 2 = vast aantal caramboles
     * 3 = aantal caramboles op basis van moyenne en <moyAantBrt> beurten
     */
    idxOptie: number = 0;
    vastAantBrt: number = 0;
    vastAantCar: number = 0;
    maxBeurten: number = 0;
    moyAantBrt: number = 0;
    knbbKlasse: string = '';
}

export class WedTelling {
    /**
     * idxOptie :
     * 0 = KNBB telling (1 punt per 10% van te maken caramboles)
     * 1 = telling aangegeven door <....Punten> velden
     */
    idxOptie: number = 0;
    winstPunten: number = 0;
    gelijkPunten: number = 0;
    bovenMoyPunten: number = 0;
}

export class WedTeam {
    teamId: string = '';
    teamNaam: string = '';
    metWit: boolean = true;
    actief: boolean = false;
    teamTsMoy: number = 0;
    teamTsCar: number = 0;
    teamTsBrt: number = 0;
    stand: WedSpelerStand = new WedSpelerStand();
    message: SpelerMessage = new SpelerMessage();
    spelers: WedSpeler[] = [];
}

export class WedSpeler {
    splId: string = '';
    splNaam: string = '';
    splBordNaam: string = '';
    splSpreekNaam: string = '';
    metWit: boolean = true;
    actief: boolean = false;
    splTsMoy: number = 0;
    splTsCar: number = 0;
    splTsBrt: number = 0;
    stand: WedSpelerStand = new WedSpelerStand();
    message: SpelerMessage = new SpelerMessage();
}

export class WedSpelerStand {
    aantCar: number = 0;
    aantBrt: number = 0;
    gemiddelde: number = 0;
    hoogSer: number = 0;
    punten: number = 0;
    serie: number = 0;
    score: number[] = [];
    laatste5brt: number[] = [];
    voortgang: number = 0;
    moyView: string = '0,000';
    percView: string = '0,00';
}

export class WedstrijdLeesResultaat {
    gevonden: boolean = false;
    wedstrijd!: Wedstrijd;
}
