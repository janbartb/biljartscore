import { Component, effect, Input, input, OnInit } from '@angular/core';
import { CijferComponent } from '../cijfer/cijfer.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-getal-var',
    standalone: true,
    imports: [
        CijferComponent,
        NgClass
    ],
    templateUrl: './getal-var.component.html',
    styleUrl: './getal-var.component.css'
})
export class GetalVarComponent implements OnInit {
    getal = input('0');
    @Input() format: string = '9';
    @Input() naam: string = 'getalvar';
    @Input() narrow: boolean = false;

    getalOld: string = '0';

    getalNum: number = 0;
    getalOldNum: number = 0;
    cijfers: string[] = [];
    moveUp: boolean = true;
    oldNarrow: boolean = false;

    cijferWidth: number = .53125;
    kommaWidth: number = .15;
    getalWidth: number = .53125;

    constructor() {
        // this.cijfers = this.getCijfers();
        effect(() => {
            const g = this.getal().replaceAll('.', '');
            const gNum = g.replaceAll(',', '.');
            this.getalNum = Number(gNum);
            this.moveUp = this.getalNum >= this.getalOldNum;
            if (this.narrow != this.oldNarrow) {
                this.oldNarrow = this.narrow;
                if (this.narrow) {
                    this.cijferWidth = .45;
                    this.kommaWidth = .12;
                }
                else {
                    this.cijferWidth = .53125;
                    this.kommaWidth = .15;
                }
            }
            if (g.length == this.getalOld.length) {
                this.cijfers = this.getCijfers(g, this.getalOld);
                this.getalOld = g;
                this.getalOldNum = this.getalNum;
            }
            else {
                if (g.length > this.getalOld.length) {
                    this.getalWidth = this.getGetalWidth(g);
                    setTimeout(() => {
                        this.cijfers = this.getCijfers(g, this.getalOld);
                        this.getalOld = g;
                        this.getalOldNum = this.getalNum;
                    }, 1000);
                }
                else {
                    this.cijfers = this.getCijfers(g, this.getalOld);
                    setTimeout(() => {
                        this.getalWidth = this.getGetalWidth(g);
                        this.getalOld = g;
                        this.getalOldNum = this.getalNum;
                    }, 2000);
                }
            }
        });
    }

    ngOnInit(): void {
        let n = this.getal();
        this.getalOld = n;
        this.oldNarrow = this.narrow;
        if (this.narrow) {
            this.cijferWidth = .45;
            this.kommaWidth = .12;
        }
        else {
            this.cijferWidth = .53125;
            this.kommaWidth = .15;
        }
        this.getalWidth = this.getGetalWidth(n);        
    }

    private getCijfers(g: string, oldG: string): string[] {
        let result = g.split('');
        const diff = this.format.length - g.length;
        for (let i = 0; i < diff; i++) {
            result.unshift('0');
        }
        return result;
    }

    private getGetalWidth(g: string): number {
        let result = 0;
        let aantDig = g.length;
        if (g.includes(',')) {
            aantDig--;
            result = this.kommaWidth;
        }
        result += (aantDig * this.cijferWidth);
        return result;
    }

}
