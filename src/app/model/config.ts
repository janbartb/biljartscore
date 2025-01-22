import { District } from "./district";

export class Config {
    spelsoort: string = "3BA";
    vereniging: string = '';
    seizoen: string = '';
    district: District = new District();
    id: number = 0;
    klasse: string = '';
    speech: boolean = true;
    stem: string = '';
    notify: boolean = false;
    version: string = '1.0.0';
}
