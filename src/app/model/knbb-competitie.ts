import { Team } from "./vereniging";

export class KnbbCompetitie {
    competitieId: string = '';
    knbbId: string = '';
    seizoen: string = '';
    district: string = '';
    spelsoort: string = '';
    klasse: string = '';
    volgNr: number = 0;
    poule: number = 0;
    naam: string = '';
    maxBeurten: number = 0;
    teams: KnbbCompTeam[] = [];
}

export class KnbbCompTeam {
    verId: string = '';
    teamId: string = '';

    constructor(verId: string, teamId: string) {
        this.verId = verId;
        this.teamId = teamId;
    }
}

export class KnbbCompTeamOld {
    compTeamId: string = '';
    verId: string = '';
    teamId: string = '';
    klasse: string = '';
    volgNr: number = 0;
    naam: string = '';
    spelers: KnbbCompTeamSpeler[] = [];
    matches: KnbbCompMatchResultaat[] = [];

    constructor(team: Team) {
        this.verId = team.verId;
        this.teamId = team.teamId;
        this.klasse = team.klasse;
        this.volgNr = team.volgNr;
        this.compTeamId = this.verId + '|' + this.teamId;
        this.naam = team.naam;
    }
}

export class KnbbCompTeamSpeler {
    splId: string = '';

    constructor(id: string) {
        this.splId = id;
    }
}

export class KnbbCompMatchResultaat {
    tegTeamId: string = '';
    datum: string = '';
    wedstrijden: KnbbCompWedstrijdResultaat[] = [];
}

export class KnbbCompWedstrijdResultaat {
    splId: string = '';
    tegSplId: string = '';
    teSpelen: number = 0;
    aantCar: number = 0;
    aantBrt: number = 0;
    hoogSer: number = 0;
    punten: number = 0;
    score: number[] = [];
}