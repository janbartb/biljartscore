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
    getal = input('0');
    @Input() isSerie: boolean = false;
    @Input() format: string = '9';
    @Input() naam: string = 'getal';

    getalNum: number = 0;
    getalOld: number = 0;
    cijfers: string[] = [];
    useZeroes: boolean[] = [];
    moveUp: boolean = true;

    constructor() {
        // this.getalOld = this.getal();
        // this.useZeroes = this.getUseZeroes();
        // this.cijfers = this.getCijfers();
        effect(() => {
            const g = this.getal().replaceAll('.', '');
            const gNum = g.replaceAll(',', '.');
            this.getalNum = Number(gNum);
            this.moveUp = this.getalNum >= this.getalOld;
            const formatArr = this.format.length ? this.format.split('') : [];
            this.useZeroes = this.getUseZeroes(g, formatArr);
            this.cijfers = this.getCijfers(g, formatArr);
            this.getalOld = this.getalNum;
        });
    }

    private getUseZeroes(g: string, fmtArr: string[]): boolean[] {
        let result: boolean[] = [];
        if (!fmtArr.length) {
            for (let i = 0; i < g.length; i++) {
                result[i] = true;
            }
        }
        else {
            fmtArr.forEach(d => {
                result.push((d == '0' || d == ',') ? false : true);
            });
            const diff = fmtArr.length - g.length;
            for (let i = 0; i < fmtArr.length; i++) {
                if (i > diff) {
                    result[i] = true;
                }
                else {
                    result[i] = (fmtArr[i] == '9') ? true : false;
                }
            }
        }
        return result;
    }

    private getCijfers(g: string, fmtArr: string[]): string[] {
        let result = g.split('');
        if (fmtArr.length) {
            const diff = fmtArr.length - result.length;
            if (diff < 0) {
                const diff2 = Math.abs(diff);
                for (let i = 0; i < diff2; i++) {
                    result.shift(); // remove first element of array
                }
            }
            else {
                for (let i = 0; i < diff; i++) {
                    result.unshift((fmtArr[i] == '9' ? '0' : ' '));
                }
            }
        }
        return result;
    }
}
