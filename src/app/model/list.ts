export class List<T> {
    items: T[] = [];
    filtered: T[] = [];
    selectedIdx: number = -1;

    clearSelection(): void {
        this.selectedIdx = -1;
    }

    fillItems(items: T[]): void {
        this.selectedIdx = -1;
        this.items = items;
        this.filtered = items.filter(x => true);
    }

    filter(filterFunction: (_: T) => {}) {
        this.selectedIdx = -1;
        this.filtered = this.items.filter(filterFunction);
        console.log(this.filtered.length);
    }

    getItem(idx: number): T | undefined {
        return (idx >= 0 && idx < this.filtered.length) ? this.filtered[idx] : undefined;
    }

    getSelectedItem(): T | undefined {
        return this.isItemSelected() ? this.filtered[this.selectedIdx] : undefined;
    }

    selectItem(idx: number) {
        this.selectedIdx = (idx >= 0 && idx < this.filtered.length) ? idx : -1;
    }

    selectNextItem(): void {
        if (!this.filtered.length) {
            return;
        }
        let idx = this.selectedIdx;
        idx++;
        if (idx >= this.filtered.length) {
            idx = 0;
        }
        this.selectedIdx = idx;
    }

    selectPreviousItem(): void {
        if (!this.filtered.length) {
            return;
        }
        let idx = this.selectedIdx;
        idx--;
        if (idx < 0) {
            idx = this.filtered.length - 1;
        }
        this.selectedIdx = idx;
    }

    isItemSelected(): boolean {
        return this.selectedIdx >= 0 && this.selectedIdx < this.filtered.length; 
    }

    isFilled(): boolean {
        return this.filtered.length > 0;
    }
}
