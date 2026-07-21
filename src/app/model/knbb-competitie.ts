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
    osKlasse: string = '';
    osOrg: string = '';
    osComp: string = '';
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