import { District } from "./district";

export class Config {
    spelsoort: string = "3BA";
    vereniging: string = '';
    seizoen: string = '';
    district: District = new District();
    klasse: string = '';
    speech: boolean = true;
    stem: string = '';
}
