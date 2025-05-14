export class OefWedstrijd {
    aantSpelers: number = 0;
    isVastAantBrt: boolean = true;
    isVastAantCar: boolean = true;
    maxBeurten: number = 0;
    tsBeurten: number = 0;
    tsCaramboles: number = 0;
    wedOver: boolean = false;
    idxSpeler: number = -1;
    idxTeam: number = -1;
    spelers: OefWedSpeler[] = [];
    teams: OefWedTeam[] = [];
}

export class OefWedTeam {
    teamIdx: number = -1;
    teamNaam: string = '';
    metWit: boolean = true;
    active: boolean = false;
    teamTsGem: number = 0;
    teamTsCar: number = 0;
    teamTsBrt: number = 0;
    stand: OefWedTeamStand = new OefWedTeamStand();
    spelers: OefWedSpeler[] = [];

    constructor(idx: number, naam: string) {
        this.teamIdx = idx;
        this.teamNaam = naam;
        this.metWit = idx == 0;
    }
}

export class OefWedSpeler {
    splIdx: number = -1;
    teamIdx: number = -1;
    splId: string = '';
    splNaam: string = '';
    splBordNaam: string = '';
    splSpreekNaam: string = '';
    metWit: boolean = true;
    active: boolean = false;
    splTsGem: number = 0;
    splTsCar: number = 0;
    splTsBrt: number = 0;
    stand: OefWedSpelerStand = new OefWedSpelerStand();

    constructor(idxSpl: number, idxTeam?: number) {
        this.splIdx = idxSpl;
        this.metWit = idxSpl == 0 || idxSpl == 2;
        if (idxTeam != undefined) {
            this.teamIdx = idxTeam;
            this.metWit = idxTeam == 0;
        }
    }
}

export class OefWedTeamStand {
    hoogSer: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    gemiddelde: number = 0;
    serie: number = 0;
    punten: number = 0;
    score: number[] = [];
    laatste5brt: number[] = [];
}

export class OefWedSpelerStand {
    hoogSer: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    gemiddelde: number = 0;
    serie: number = 0;
    punten: number = 0;
    score: number[] = [];
    laatste5brt: number[] = [];
}

export class OefWedstrijdLeesResultaat {
    gevonden: boolean = false;
    wedstrijd!: OefWedstrijd;
}
