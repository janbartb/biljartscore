export class Speler {
    id: string = '';
    knbbId: string = '';
    anaam: string = '';
    vnaam: string = '';
    tvoeg: string = '';
    bordnaam: string = '';
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
    idxMoyenne = -1;
    knbbMoy: string = '';
    selected: boolean = false;

    constructor(speler: Speler, spelId?: string) {
        this.speler = speler;
        if (spelId) {
            this.idxMoyenne = speler.gemiddeldes.findIndex(gem => gem.spelId == spelId);
        }
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

    getGemiddeldeVanSpel(): number {
        return this.idxMoyenne >= 0 ? this.speler.gemiddeldes[this.idxMoyenne].gemiddelde : 0;
    }
}

export class SpelerSelectie {
    spelerId: string = '';
    spelerNaam: string = '';
    spelerMoy: number = 0;
    spelerSelected: boolean = false;
}

export class SpelerKnbbData {
    id: string = '';
    naam: string = '';
    gem: string = '';
}
