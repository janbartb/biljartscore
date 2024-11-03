export class MoyenneTabel {
    tabId: string = '';
    spelsoort: string = '';
    klasse: string = '';
    minimum: number = 0;
    moyennes: MoyenneTabelEntry[] = []; 
}

export class MoyenneTabelEntry {
    vanaf: number = 0;
    cars: number = 0;
    filled: boolean = false;
}

export class MoyenneEntryToAdd {
    entry: MoyenneTabelEntry = new MoyenneTabelEntry();
    vanafValid: boolean = false;
    carsValid: boolean = false;
}

export class MoyenneEntryToEdit {
    index: number = -1;
    entry: MoyenneTabelEntry = new MoyenneTabelEntry();
    carsValid: boolean = false;
}