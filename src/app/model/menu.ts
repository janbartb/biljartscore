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

export class MenuAction {
    shortcut: string = '';
    text: string = '';
    action: Function | null = null;
    filler: boolean = false

    constructor(shortcut: string, text: string, action: Function | null, filler?: boolean) {
        this.shortcut = shortcut;
        this.text = text;
        this.action = action;
        if (filler) {
            this.filler = true;
        }
    }
}

export class Menu {
    actions: MenuAction[] = [];
    items: MenuItem[] = [];
    centered: boolean = false;
    selectedIdx: number = -1;

    addAction(action: MenuAction) {
        this.actions.push(action);
    }

    addItem(item: MenuItem) {
        this.items.push(item);
    }

    getItem(shortcut: string): MenuItem | undefined {
        return this.items.find(item => item.shortcut == shortcut);
    }

    getAction(shortcut: string): MenuAction | undefined {
        return this.actions.find(act => act.shortcut == shortcut);
    }

    getIndex(item: MenuItem): number {
        return this.items.findIndex(itm => itm.shortcut == item.shortcut)
    }

    getActionIndex(action: MenuAction): number {
        return this.actions.findIndex(act => act.shortcut == action.shortcut)
    }

    getSelectedItem(): MenuItem | undefined {
        if (this.noItemSelected()) {
            return undefined;
        }
        return this.items[this.selectedIdx];
    }

    getSelectedAction(): MenuAction | undefined {
        if (this.noActionSelected()) {
            return undefined;
        }
        return this.actions[this.selectedIdx];
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

    selectNextAction() {
        if (this.getAllActionsNotFillers().length < 1) {
            return;
        }
        let idx = this.selectedIdx;
        let nextItemFound = false;
        while (!nextItemFound) {
            idx++;
            if (idx == this.actions.length) {
                idx = 0;
            }
            if (!this.actions[idx].filler) {
                nextItemFound = true;
                this.selectedIdx = idx;
            }
        }
    }

    selectPreviousAction() {
        if (this.getAllActionsNotFillers().length < 1) {
            return;
        }
        let idx = this.selectedIdx;
        let previousItemFound = false;
        while (!previousItemFound) {
            idx--;
            if (idx < 0) {
                idx = this.actions.length - 1;
            }
            if (!this.actions[idx].filler) {
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

    private getAllActionsNotFillers() {
        return this.actions.filter(act => !act.filler);
    }

    private noItemSelected(): boolean {
        return this.selectedIdx < 0 || this.selectedIdx >= this.items.length;
    }

    private noActionSelected(): boolean {
        return this.selectedIdx < 0 || this.selectedIdx >= this.actions.length;
    }
}