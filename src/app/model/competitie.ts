export class Competitie {
    cmpNaam: string = '';
    cmpNaamDelen: CompNaamDelen = new CompNaamDelen('');
    cmpAantRondes: number = 0;
    cmpRegels: CompRegels = new CompRegels();
    cmpTelling: CompTelling = new CompTelling();
    cmpSpelers: CmpSpeler[] = [];

    constructor(naam: string) {
        this.cmpNaam = naam;
        this.cmpNaamDelen = new CompNaamDelen(naam);
    }
}

export class CompNaamDelen {
    cmpType: string = '';
    cmpSpelId: string = '';
    cmpJaar: number = 0;
    cmpVolgNr: number = 0;

    constructor(naam: string) {
        if (naam.trim() == '') {
            return;
        }
        const arr = naam.split('-');
        if (arr.length < 4) {
            return;
        }
        this.cmpVolgNr = +arr[arr.length - 1];
        this.cmpJaar = +arr[arr.length - 2];
        this.cmpSpelId = arr[arr.length - 3];
        for (let i = 0; i < arr.length - 3; i++) {
            if (i > 0) {
                this.cmpType += '-';
            }
            this.cmpType += arr[i];
        }
    }
}

export class CompRegels {
    idxOptie: number = 0;
    vastAantBrt: number = 0;
    vastAantCar: number = 0;
    maxBeurten: number = 0;
    moyAantBrt: number = 0;
    knbbKlasse: string = '';
}

export class CompTelling {
    idxOptie: number = 0;
    winstPunten: number = 0;
    gelijkPunten: number = 0;
    bovenMoyPunten: number = 0;
}

export class CmpSpeler {
    splId: string = '';
    splNaam: string = '';
    splBordnaam: string = '';
    splSpreeknaam: string = '';
    splInit: string = '';
    splMoyenne: number = 0;
    splTeSpelenCar: number = 0;
    splTeSpelenBrt: number = 0;
    splRondes: CmpSplRonde[] = [];

    constructor(aantRondes: number) {
        for (let i = 0; i < aantRondes; i++) {
            this.splRondes.push(new CmpSplRonde(i + 1));
        }
    }
}

export class CmpSplRonde {
    rondeNr: number = 0;
    wedstrijden: CmpSplWedstrijd[] = [];

    constructor(nr: number) {
        this.rondeNr = nr;
    }
}

export class CmpSplWedstrijd {
    wedOver: boolean = false;
    metWit: boolean = false;
    datum: string = '';
    tegId: string = '';
    tegNaam: string = '';
    aantCar: number = 0;
    aantBrt: number = 0;
    hoogSer: number = 0;
    aantPnt: number = 0;
    scores: number[] = [];
    ronde: number = -1;
}

export class CmpSpelerTotalen {
    speler: CmpSpeler = new CmpSpeler(1);
    rondeTotalen: CmpRondeTotalen[] = [];

    constructor(spl: CmpSpeler, aantRondes: number) {
        this.speler = spl;
        for (let i = 0; i <= aantRondes; i++) {
            this.rondeTotalen.push(new CmpRondeTotalen(i));
        }
    }
}

export class CmpRondeTotalen {
    rondeNr: number = 0;
    aantWed: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    moyenne: number = 0;
    hoogSer: number = 0;
    aantPnt: number = 0;
    perc: number = 0;

    constructor(nr: number) {
        this.rondeNr = nr;
    }
}

export class CmpAantWedGespeeld {
    rondes: number[] = [];
    klaar: boolean[] = [];
}

export class CompLeesResultaat {
    gevonden: boolean = false;
    comp: Competitie = new Competitie('');
}

export class CmpSchemaRonde {
    spelers: CmpSchemaSpeler[] = [];
}

export class CmpSchemaSpeler {
    splId: string = '';
    splInits: string = '';
    splBordnaam: string = '';
    splWeds: CmpSchemaWedstrijd[] = [];
}

export class CmpSchemaWedstrijd {
    wedOver: boolean = false;
    tegId: string = '';
    tegInits: string = '';
    tegBordNaam: string = '';
    metWit: boolean = false;
    gespeeld: boolean = false;
    winst: number = -1;
    punten: number = 0;
}

export class CompetitieMatch {
    cmpNaam: string = '';
    cmpRonde: number = 0;
    datum: string = '';
    matchOver: boolean = false;
    opgeslagen: boolean = false;
    regels: CompRegels = new CompRegels();
    telling: CompTelling = new CompTelling();
    spelers: CmpMatchSpeler[] = [];
}

export class CmpMatchSpeler {
    id: string = '';
    naam: string = '';
    bordNaam: string = '';
    spreekNaam: string = '';
    metWit: boolean = true;
    active: boolean = false;
    tsMoy: number = 0;
    tsCar: number = 0;
    tsBrt: number = 0;
    stand: CmpMatchSpelerStand = new CmpMatchSpelerStand();

    constructor(spl: CmpSpeler, wit: boolean) {
        this.id = spl.splId;
        this.naam = spl.splNaam;
        this.bordNaam = spl.splBordnaam;
        this.spreekNaam = spl.splSpreeknaam;
        this.metWit = wit;
        this.tsMoy = spl.splMoyenne;
        this.tsCar = spl.splTeSpelenCar;
        this.tsBrt = spl.splTeSpelenBrt;
    }
}

export class CmpMatchSpelerStand {
    hoogSer: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    gemiddelde: number = 0;
    serie: number = 0;
    punten: number = 0;
    score: number[] = [];
    laatste5brt: number[] = [];
}

export class CmpMatchLeesResultaat {
    gevonden: boolean = false;
    match: CompetitieMatch = new CompetitieMatch();
}
