export class Spelsoort {
    spelsoortId: string = '';
    spelsoortNaam: string = '';
    magWeg: boolean = false;

    constructor(id: string, naam: string, weg?: boolean) {
        this.spelsoortId = id;
        this.spelsoortNaam = naam;
        if (weg) {
            this.magWeg = weg;
        }
    }
}