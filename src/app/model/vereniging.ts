import { Speler } from "./speler";

export class Vereniging {
    verId: string = '';
    knbbId: string = '';
    naam: string = '';
    korteNaam: string = '';
    locatie: string = '';
    plaats: string = '';
    teams: Team[] = []; 
}

export class Team {
    verId: string = '';
    teamId: string = '';
    knbbId: string = '';
    spelsoort: string = '';
    klasse: string = '';
    volgNr: number = 0;
    naam: string = '';
    teamLeden: string[] = [];
}

export class VerenigingKort {
    verId: string = '';
    naam: string = '';
    korteNaam: string = '';
    inTeam: boolean = false;

    constructor(vereniging: Vereniging) {
        this.verId = vereniging.verId;
        this.naam = vereniging.naam;
        this.korteNaam = vereniging.korteNaam;
    }
}

export class VerenigingWrapper {
    vereniging: Vereniging = new Vereniging();
    leden: Speler[] = [];

    constructor(vereniging: Vereniging, leden?: Speler[]) {
        this.vereniging = vereniging;
        if (leden) {
            this.leden = leden;
        }
    }

    getTeams(spelId: string): Team[] {
        return this.vereniging.teams.filter(team => team.spelsoort == spelId);
    }

    getTeamsForSpelEnKlasse(spelId: string, klasse: string): Team[] {
        return this.vereniging.teams.filter(team => team.spelsoort == spelId && team.klasse == klasse);
    }
}

export class TeamWrapper {
    team: Team = new Team();
    leden: Speler[] = [];

    constructor(team: Team, leden?: Speler[]) {
        this.team = team;
        if (leden) {
            this.leden = leden;
        }
    }
}