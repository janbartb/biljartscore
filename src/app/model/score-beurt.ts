export class ScoreBeurt {
    serie: number = 0;
    totaal: number = 0;
    gespeeld: boolean = false;
    verberg: boolean = false;
}

export class ScoreSpeler {
    naam: string = '';
    tsCar: number = 0;
    scores: ScoreBeurt[] = [];
    dim: LijstDimensies = new LijstDimensies();
}

export class LijstDimensies {
    maxBrt: number = 0;
    totBrt: number = 0;
    pages: number[] = [0];
    pageRows: number = 0;
    rowHeight: number = 0;
    fontSize: number = .5;
}