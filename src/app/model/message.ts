export class Message {
    text: string = '';
    type: string = 'info';
    visible: boolean = false;

    constructor(...args: string[]) {
        if (!args) {
            return;
        }
        if (args.length == 1) {
            this.text = args[0];
        }
        if (args.length == 2) {
            this.type = args[0];
            this.text = args[1];
        }
    }

    reset(): void {
        this.visible = false;
        this.text = '';
        this.type = 'info';

    }

    show(): void {
        this.visible = true;
    }

    hide(): void {
        this.visible = false;
    }
}
