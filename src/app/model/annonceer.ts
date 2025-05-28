export class Annonceer {
    config: AnnonConfig = new AnnonConfig();
    wedGespeeld: boolean = false;
    spelers: AnnonSpeler[] = [];
}

export class AnnonConfig {
    aantSpelers: number = 0;
    cats: AnnonCat[] = [];
    carsObvMoyenne: boolean = false;
    vastAantCars: number = 5;

    constructor() {
        this.cats.push(new AnnonCat('rood', 'Over rood'));
        this.cats.push(new AnnonCat('dir', 'Direct'));
        this.cats.push(new AnnonCat('los', 'Losse band', 'Losseband'));
        this.cats.push(new AnnonCat('drie', 'Drieband'));        
    }
}

export class AnnonSpeler {
    splId: string = '';
    splNaam: string = '';
    splBordNaam: string = '';
    splSpreekNaam: string = '';
    metWit: boolean = true;
    actief: boolean = false;
    splTsCar: number = 0;
    splTsCarArr: number[] = [];
    splTsMoy: number = 0;
    grid: AnnonGrid = new AnnonGrid();
    stand!: AnnonSpelerStand;

    constructor(aantCats: number) {
        this.stand = new AnnonSpelerStand(aantCats);
    }
}

export class AnnonSpelerStand {
    aantBrt: number = 0;
    totaal!: AnnonSerie;
    punten: number = 0;
    serie!: AnnonSerie;
    scores: AnnonSerie[] = [];

    constructor(aantCats: number) {
        this.totaal = new AnnonSerie(aantCats);
        this.serie = new AnnonSerie(aantCats);
    }
}

export class AnnonSerie {
    cars: number[] = [];

    constructor(aantCats: number) {
        for (let i = 0; i < aantCats; i++) {
            this.cars.push(0);
        }
    }
}

export class AnnonCat {
    id: string = '';
    naam: string = '';
    spkNaam: string = '';

    constructor(id: string, nm: string, spk?: string) {
        this.id = id;
        this.naam = nm;
        this.spkNaam = spk ? spk : nm;
    }
}

export class AnnonGrid {
    balContainerWidth: number = 0;
    balWidth: number = 0;
}

export class AnnonLeesResultaat {
    gevonden: boolean = false;
    annon!: Annonceer;
}
