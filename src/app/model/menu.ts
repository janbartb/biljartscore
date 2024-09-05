export class MenuItem {
    shortcut: string = '';
    text: string = '';
    navigateTo: string = '';
    filler: boolean = false

    constructor(shortcut: string, text: string, navigateTo: string, filler?: boolean) {
        this.shortcut = shortcut;
        this.text = text;
        this.navigateTo = navigateTo;
        if (filler) {
            this.filler = true;
        }
    }
}

export class Menu {
    items: MenuItem[] = [];
    centered: boolean = false;
    selectedIdx: number = -1;

    addItem(item: MenuItem) {
        this.items.push(item);
    }

    getItem(shortcut: string): MenuItem | undefined {
        return this.items.find(item => item.shortcut == shortcut);
    }

    getIndex(item: MenuItem): number {
        return this.items.findIndex(itm => itm.shortcut == item.shortcut)
    }

    getSelectedItem(): MenuItem | undefined {
        if (this.noItemSelected()) {
            return undefined;
        }
        return this.items[this.selectedIdx];
    }

    selectItem(idx: number) {
        this.selectedIdx = idx;
    }

    selectNextItem() {
        if (this.getAllItemsNotFillers().length < 1) {
            return;
        }
        let idx = this.selectedIdx;
        let nextItemFound = false;
        while (!nextItemFound) {
            idx++;
            if (idx == this.items.length) {
                idx = 0;
            }
            if (!this.items[idx].filler) {
                nextItemFound = true;
                this.selectedIdx = idx;
            }
        }
    }

    selectPreviousItem() {
        if (this.getAllItemsNotFillers().length < 1) {
            return;
        }
        let idx = this.selectedIdx;
        let previousItemFound = false;
        while (!previousItemFound) {
            idx--;
            if (idx < 0) {
                idx = this.items.length - 1;
            }
            if (!this.items[idx].filler) {
                previousItemFound = true;
                this.selectedIdx = idx;
            }
        }
    }

    cancelSelection() {
        this.selectedIdx = -1;
    }

    private getAllItemsNotFillers() {
        return this.items.filter(item => !item.filler);
    }

    private noItemSelected(): boolean {
        return this.selectedIdx < 0 || this.selectedIdx >= this.items.length;
    }
}