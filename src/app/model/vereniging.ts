import { Speler } from "./speler";

export class Vereniging {
    verId: string = '';
    naam: string = '';
    korteNaam: string = '';
    locatie: string = '';
    teams: Team[] = []; 
}

export class Lokaliteit {
    lokId: string = '';
    knbbId: string = '';
    naam: string = '';
    adres: string = '';
    postcode: string = '';
    plaats: string = '';
    telefoon: string = '';
    email: string = '';
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
    inBpoint?: boolean = false;
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
    lokaliteit: Lokaliteit = new Lokaliteit();
    leden: Speler[] = [];

    constructor(vereniging: Vereniging, lokaliteit: Lokaliteit, leden?: Speler[]) {
        this.vereniging = vereniging;
        this.lokaliteit = lokaliteit;
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