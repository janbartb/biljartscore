import { District } from "./district";

export class BpCompetitie {
    bssId: string = '';
    knbbId: string = '';
    district: District = new District();
    spelsoortId: string = '';
    seizoen: string = '';
    poule: string = '';
    klasse: string = '';
    volgNr: string = '';
    naam: string = '';
    bpUrl: string = '';
    maxBeurten: string = '';
    inBss: boolean = false;
    teams: BpTeam[] = [];
}

export class BpTeam {
    knbbId: string = '';
    naam: string = '';
    bpUrl: string = '';
    bssVerId: string = '';
    bssTeamId: string = '';
    bssLokId: string = '';
    bssAantSpl: number = 0;
    inBssComp: boolean = false;
}

export class BpSpeler {
    knbbId: string = '';
    bssId: string = '';
    naam: string = '';
    moyenne: string = '';
}

export class BpDistrict {
    isDefault: boolean = false;
    bssId: string = '';
    knbbId: string = ''
    naam: string = '';
}

export class BpMoyTabel {
    klasse: string = '';
    minimum: string = '';
    entries: BpMoyTabelEntry[] = [];
}

export class BpMoyTabelEntry {
    vanaf: string = '';
    cars: string = '';
}

export class BpLokaliteit {
    knbbId: string = '';
    bssId: string = '';
    naam: string = '';
    adres: string = '';
    postcode: string = '';
    plaats: string = '';
    telefoon: string = '';
    email: string = '';
}

export class CompTemp {
    maxBeurten: string = '';
    teams: TeamTemp[] = [];
}

export class TeamTemp {
    naam: string = '';
    bpUrl: string = '';
}

export class CompPageData {
    maxBeurten: string = '';
    teams: TeamTemp[] = [];
}

export class TeamPageData {
    lokData: string = '';
    spelers: TeamPageSpeler[] = [];
}

export class TeamPageSpeler {
    splKnbbId: string = '';
    splNaam: string = '';
    splNaamOrig: string = '';
    splMoyenne: string = '';
}