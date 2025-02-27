export class List<T> {
    items: T[] = [];
    filtered: T[] = [];
    selectedIdx: number = -1;
    hoveredIdx: number = -1;

    clearSelection(): void {
        this.selectedIdx = this.hoveredIdx = -1;
    }

    clear(): void {
        this.filtered = [];
        this.items = [];
        this.selectedIdx = this.hoveredIdx = -1;
    }

    fillItems(items: T[]): void {
        this.selectedIdx = -1;

        this.items = items;
        this.filtered = items.filter(x => true);
    }

    filter(filterFunction: (_: T) => {}) {
        this.selectedIdx = -1;
        this.filtered = this.items.filter(filterFunction);
    }

    getItem(idx: number): T | undefined {
        return (idx >= 0 && idx < this.filtered.length) ? this.filtered[idx] : undefined;
    }

    getSelectedItem(): T | undefined {
        return this.isItemSelected() ? this.filtered[this.selectedIdx] : undefined;
    }

    getHoveredItem(): T | undefined {
        return this.isItemHovered() ? this.filtered[this.hoveredIdx] : undefined;
    }

    selectItem(idx: number) {
        this.selectedIdx = (idx >= 0 && idx < this.filtered.length) ? idx : -1;
    }

    hoverItem(idx: number) {
        this.hoveredIdx = (idx >= 0 && idx < this.filtered.length) ? idx : -1;
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

    hoverNextItem(): void {
        if (!this.filtered.length) {
            return;
        }
        let idx = this.hoveredIdx;
        idx++;
        if (idx >= this.filtered.length) {
            idx = 0;
        }
        this.hoveredIdx = idx;
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

    hoverPreviousItem(): void {
        if (!this.filtered.length) {
            return;
        }
        let idx = this.hoveredIdx;
        idx--;
        if (idx < 0) {
            idx = this.filtered.length - 1;
        }
        this.hoveredIdx = idx;
    }

    isIndexWithinRange(idx: number): boolean {
        return idx >= 0 && idx < this.filtered.length;
    }

    isItemSelected(): boolean {
        return this.selectedIdx >= 0 && this.selectedIdx < this.filtered.length; 
    }

    isItemHovered(): boolean {
        return this.hoveredIdx >= 0 && this.hoveredIdx < this.filtered.length; 
    }

    isFilled(): boolean {
        return this.filtered.length > 0;
    }

    isEmpty(): boolean {
        return this.items.length == 0;
    }
}
