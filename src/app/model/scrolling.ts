export class Scrolling {
    areaElm: HTMLDivElement;
    scrollPos: number = 0;
    itemHeight: number = 48;
    areaHeight: number = 0;
    nrOfItems: number = 0;
    upStartIdx: number = 0;
    downStartIdx: number = 0;

    constructor (elm: HTMLDivElement, elmHeight: number, totItems: number, selectedIdx?: number) {
        this.areaElm = elm;
        this.areaHeight = elmHeight;
        this.nrOfItems = totItems;
        const itemsPerPage = Math.round(this.areaHeight / this.itemHeight);
        this.downStartIdx = Math.round(itemsPerPage / 2);
        this.upStartIdx = this.nrOfItems - this.downStartIdx;
        console.log(itemsPerPage + ' - ' + this.downStartIdx + ' - ' + this.upStartIdx)
        this.areaElm.scrollTop = 0;
        if (selectedIdx && selectedIdx > this.downStartIdx) {
            this.scrollTo(selectedIdx);
        }
    }

    scrollDown(idx: number) {
        //console.log(idx + ' - ' + this.downStartIdx + ' - ' + this.scrollPos);
        if (idx <= 0) {
            this.areaElm.scrollTop = this.scrollPos = 0;
            return;
        }
        if (idx >= this.downStartIdx) {
            this.areaElm.scrollTop = this.scrollPos + this.itemHeight;
            this.scrollPos = this.areaElm.scrollTop;
        }
    }

    scrollUp(idx: number) {
        //console.log(idx + ' - ' + this.upStartIdx + ' - ' + this.scrollPos);
        if (idx >= this.nrOfItems - 1) {
            this.areaElm.scrollTop = this.scrollPos = this.areaElm.scrollHeight;
            return;
        }
        if (idx < this.upStartIdx) {
            this.areaElm.scrollTop = this.scrollPos - this.itemHeight;
            this.scrollPos = this.areaElm.scrollTop;
        }
    }

    scrollTo(idx: number) {
        this.areaElm.scrollTop = idx * this.itemHeight;
        this.scrollPos = this.areaElm.scrollTop;

    }

    scrollToTop() {
        this.areaElm.scrollTop = 0;
        this.scrollPos = this.areaElm.scrollTop;
    }
}