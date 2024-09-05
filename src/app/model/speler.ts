export class Speler {
    id: string = '';
    knbbId: string = '';
    anaam: string = '';
    vnaam: string = '';
    tvoeg: string = '';
    spreeknaam: string = '';
    gemiddeldes: SpelerGemiddelde[] = [];
    verenigingIds: string[] = [];
}

export class SpelerGemiddelde {
    spelId: string = '';
    gemiddelde: number = 0;
}

export class SpelerWrapper {
    speler: Speler = new Speler();

    constructor(speler: Speler) {
        this.speler = speler;
    }

    getNaam(): string {
        return this.speler.vnaam + (this.speler.tvoeg.length ? ' ' + this.speler.tvoeg : '') + ' ' + this.speler.anaam;
    }

    getSpelsoortIds(): string[] {
        return this.speler.gemiddeldes.map(gem => gem.spelId);
    }

    isLidVan(verenigingId: string): boolean {
        return this.speler.verenigingIds.some(ver => ver == verenigingId);
    }

    getGemiddeldeVanSpel(spelId: string): number {
        const found = this.speler.gemiddeldes.find(gem => gem.spelId == spelId);
        return found ? found.gemiddelde : 0;
    }
}
