export class Seizoenen {
    compSeizoenen: CompSeizoenen[] = [];
}

export class CompSeizoenen {
    compId: string = '';
    seizoenen: string[] = [];

    constructor(id: string) {
        this.compId = id;
    }
}