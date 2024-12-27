export class Match {
    compId: string = '';
    klasse: string = '';
    maxBeurten: number = 60;
    matchOver: boolean = false;
    idxSpelerActief: number = 0;
    spelers: MatchSpeler[] = [];

    constructor() {
        this.spelers.push(new MatchSpeler());
        this.spelers.push(new MatchSpeler());
    }
}

export class TeamMatch {
    compId: string = '';
    klasse: string = '';
    maxBeurten: number = 60;
    matchOver: boolean = false;
    idxTeamActief: number = 0;
    idxWedActief: number = 0;
    gameOver: boolean[] = [false, false, false];
    teams: MatchTeam[] = [];
}

export class MatchTeam {
    isManual: boolean = false;
    verId: string = '';
    verNaam: string = '';
    teamId: string = '';
    teamNaam: string = '';
    klasse: string = '';
    spelers: MatchSpeler[] = [];

    constructor() {
        this.spelers.push(new MatchSpeler());
        this.spelers.push(new MatchSpeler());
        this.spelers.push(new MatchSpeler());
    }
}

export class MatchSpeler {
    splId: string = '';
    splNaam: string = '';
    verId: string = '';
    teamId: string = '';
    splBordNaam: string = '';
    splSpreekNaam: string = '';
    isActief: boolean = false;
    metWit: boolean = false;
    splTsGem: number = 0;
    splTsCar: number = 0;
    stand: MatchSpelerStand = new MatchSpelerStand();
}

export class MatchSpelerStand {
    hoogSer: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    gemiddelde: number = 0;
    serie: number = 0;
    punten: number = 0;
    score: number[] = [];
    laatste5brt: number[] = [];
}

export class MatchLeesResultaat {
    gevonden: boolean = false;
    match: Match = new Match();
}

export class TeamMatchLeesResultaat {
    gevonden: boolean = false;
    match: TeamMatch = new TeamMatch();
}

export class MatchTeamTotalen {
    tsCar: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    gemiddelde: number = 0;
    percentage: number = 0;
    hoogSer: number = 0;
    punten: number = 0;
    teamPunten: number = 0;
}