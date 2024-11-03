export class Button {
    key: string = '';
    text: string = '';
    showKey: boolean = false;
    showOnlyKey: boolean = false;
    disabled: boolean = false;
    visible: boolean = true;
    selected: boolean = false;

    constructor(key: string, text: string, showKey?: boolean, onlyKey?: boolean) {
        this.key = key;
        this.text = text;
        if (showKey) {
            this.showKey = true;
        }
        if (onlyKey) {
            this.showOnlyKey = onlyKey;
        }
    }

    hide() {
        this.disabled = true;
        this.visible = false;
    }

    show() {
        this.disabled = false;
        this.visible = true;
    }

    disable() {
        this.disabled = true;
    }

    enable() {
        this.disabled = false;
    }
}

export class ButtonGroup {
    buttons: Button[] = [];
    selectedIdx: number = -1;

    addButton(button: Button) {
        this.buttons.push(button);
    }

    getButton(key: string): Button | undefined {
        return this.buttons.find(btn => btn.key == key);
    }

    disableButton(idx: number) {
        this.buttons[idx].disable();
    }

    enableButton(idx: number) {
        this.buttons[idx].enable();
    }

    getSelectedButton(): Button | undefined {
        if (this.noButtonSelected()) {
            return undefined;
        }
        return this.buttons[this.selectedIdx];
    }

    selectButton(idx: number) {
        this.selectedIdx = idx;
    }

    selectNextButton() {
        if (this.nrOfActiveButtons() == 0) {
            return;
        }
        let idx = this.selectedIdx;
        let nextButtonFound = false;
        while (!nextButtonFound) {
            idx++;
            if (idx == this.buttons.length) {
                idx = 0;
            }
            if (!this.buttons[idx].disabled) {
                nextButtonFound = true;
                this.selectedIdx = idx;
            }
        }
    }

    selectPreviousButton() {
        if (this.nrOfActiveButtons() == 0) {
            return;
        }
        let idx = this.selectedIdx;
        let previousButtonFound = false;
        while (!previousButtonFound) {
            idx--;
            if (idx < 0) {
                idx = this.buttons.length - 1;
            }
            if (!this.buttons[idx].disabled) {
                previousButtonFound = true;
                this.selectedIdx = idx;
            }
        }
    }

    cancelSelection() {
        this.selectedIdx = -1;
    }

    private noButtonSelected(): boolean {
        return this.selectedIdx < 0 || this.selectedIdx >= this.buttons.length;
    }

    private nrOfActiveButtons(): number {
        return this.buttons.filter(b => !b.disabled).length;
    }
}