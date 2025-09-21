import { Component, effect, Input, input } from '@angular/core';
import { CijferComponent } from '../cijfer/cijfer.component';

@Component({
    selector: 'app-getal',
    standalone: true,
    imports: [
        CijferComponent
    ],
    templateUrl: './getal.component.html',
    styleUrl: './getal.component.css'
})
export class GetalComponent {
    getal = input(0);
    @Input() isSerie: boolean = false;
    @Input() maxCijfers: number = 1;

    getalOld: number = 0;
    cijfers: string[] = [];
    useZeroes: boolean[] = [];
    moveUp: boolean = true;

    constructor() {
        // this.getalOld = this.getal();
        // this.useZeroes = this.getUseZeroes();
        // this.cijfers = this.getCijfers();
        effect(() => {
            const g = this.getal();
            this.moveUp = this.getal() >= this.getalOld;
            this.useZeroes = this.getUseZeroes();
            this.cijfers = this.getCijfers();
            this.getalOld = this.getal();
        });
    }

    private getUseZeroes(): boolean[] {
        let result: boolean[] = [];
        for (let i = this.maxCijfers; i > 0; i--) {
            if (i == this.maxCijfers) {
                result.unshift(true);
            }
            else {
                const diff = this.maxCijfers - i;
                result.unshift(this.getal() >= Math.pow(10, diff + 1));
            }
        }
        return result;
    }

    private getCijfers(): string[] {
        let txt: string = '' + this.getal();
        let diff = this.maxCijfers - txt.length;
        if (diff < 0) {
            this.maxCijfers = txt.length;
        }
        for (let i = 0; i < diff; i++) {
            txt = ' ' + txt;
        }
        return txt.split('');
    }
}
