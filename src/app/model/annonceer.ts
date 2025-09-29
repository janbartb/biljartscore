export class Annonceer {
    config: AnnonConfig = new AnnonConfig();
    wedGespeeld: boolean = false;
    teams: AnnonTeam[] = [];
    spelers: AnnonSpeler[] = [];
}

export class AnnonConfig {
    isAnnonceer: boolean = false;
    aantSpelers: number = 0;
    cats: AnnonCat[] = [];
    carsObvMoyenne: boolean = false;
    vastAantCars: number = 5;
}

export class AnnonTeam {
    teamId: string = '';
    teamNaam: string = '';
    metWit: boolean = true;
    actief: boolean = false;
    teamTsCar: number = 0;
    teamTsCarArr: number[] = [];
    teamTsMoy: number = 0;
    grid: AnnonGrid = new AnnonGrid();
    stand!: AnnonSpelerStand;
    spelers: AnnonSpeler[] = [];

    constructor(aantCats: number) {
        this.stand = new AnnonSpelerStand(aantCats);
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
    inBSS: boolean = true;
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
    isAnnon: boolean = false;
    catHeight: number = 0;
    balContainerWidth: number = 0;
    balWidth: number = 0;
}

export class AnnonLeesResultaat {
    gevonden: boolean = false;
    annon!: Annonceer;
}
