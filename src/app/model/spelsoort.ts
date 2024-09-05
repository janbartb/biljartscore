export class Spelsoort {
    spelId: string = '';
    spelNaam: string = '';
    magWeg: boolean = false;

    constructor(id: string, naam: string, weg?: boolean) {
        this.spelId = id;
        this.spelNaam = naam;
        if (weg) {
            this.magWeg = weg;
        }
    }
}