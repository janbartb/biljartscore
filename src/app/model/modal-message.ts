export class ModalMessage {
    texts: string[] = [];
    textToSpeak: string = '';
    type: string = 'info';
    duration: number = 0;
    visible: boolean = false;

    constructor(typ: string, txts: string[], txtToSpeak: string, duration: number, serie?: string) {
        this.type = typ;
        this.texts = txts;
        this.textToSpeak = txtToSpeak;
        this.duration = 1000 * duration;
        if (serie) {
            this.texts.push(serie);
        }
    }

    show(): void {
        this.visible = true;
    }

    hide(): void {
        this.visible = false;
    }
}