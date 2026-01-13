import { District } from "./district";

export class Config {
    spelsoort: string = '3BA';
    vereniging: string = '';
    seizoen: string = '';
    district: District = new District();
    id: number = 0;
    klasse: string = '';
    carMeteenToev: boolean = false;
    speech: boolean = true;
    stem: string = '';
    repeatRemaining: boolean = true;
    sayGenoteerd: boolean = true;
    notify: boolean = false;
    version: string = '1.0.0';
    apparaten: Apparaat[] = [];
}

export class Apparaat {
    id: string = '';
    naam: string = '';
    image: string = '';
    spelen: AppSpel[] = [];
}

export class AppSpel {
    id: string = '';
    naam: string = '';
    acties: AppSpelActie[] = [];
}

export class AppSpelActie {
    id: string = '';
    omschr: string = '';
    editable: boolean = true;
    code: string = '';
    key: string = '';
}
