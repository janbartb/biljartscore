export class ScoreBeurt {
    serie: number = 0;
    totaal: number = 0;
    gespeeld: boolean = false;
    verberg: boolean = false;
}

export class ScoreSpeler {
    naam: string = '';
    tsCar: number = 0;
    pages: number[] = [0];
    pageSize: number = 25;
    scores: ScoreBeurt[] = [];
}