import { NgClass } from '@angular/common';
import { Component, effect, Input, input } from '@angular/core';

@Component({
    selector: 'app-cijfer2',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './cijfer2.component.html',
    styleUrl: './cijfer2.component.css'
})
export class Cijfer2Component {
    cijfer = input(' ');
    @Input() useZero: boolean = true;
    @Input() moveUp: boolean = true;
    top: number = 0;
    digits: string[] = [' ', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    oldCijfer: string = ' ';

    cijfersCss: string[] = ['cijders', 'plus0', ''];

    constructor() {
        effect(() => {
            const d = this.cijfer();
            if (!this.moveUp) {
                this.digits = this.getDigits(d);
                this.cijfersCss[1] = 'plus0';
                this.oldCijfer = d;
                return;
            }
            this.cijfersCss[2] = '';
            const idx = this.digits.findIndex(dig => dig == d);
            this.cijfersCss[1] = 'plus' + idx;
            setTimeout(() => {
                this.cijfersCss[2] = 'notrans';
                this.digits = this.getDigits(d);
                this.cijfersCss[1] = 'plus0';
                this.oldCijfer = d;
            }, 1000);
        });
    }

    getDigits(start: string): string[] {
        let result: string[] = [];
        const startDigit = (start == ' ') ? 0 : parseInt(start);
        for (let i = 0; i < 10; i++) {
            let dig = startDigit + i;
            if (dig > 9) {
                dig = dig - 10;
            }
            if (dig > 0 || this.useZero) {
                result.push('' + dig);
            }
            else {
                result.push(' ');
            }
        }
        return result;
    }

    // getDigits(start: string): string[] {
    //     let result: string[] = [];
    //     const startDigit = (start == ' ') ? 0 : parseInt(start);
    //     if (this.moveUp) {
    //         for (let i = 0; i < 10; i++) {
    //             let dig = startDigit + i;
    //             if (dig > 9) {
    //                 dig = dig - 10;
    //             }
    //             if (dig > 0 || this.useZero) {
    //                 result.push('' + dig);
    //             }
    //             else {
    //                 result.push(' ');
    //             }
    //         }
    //     }
    //     else {
    //         for (let i = 0; i < 10; i++) {
    //             let dig = startDigit - i;
    //             if (dig < 0) {
    //                 dig = dig + 10;
    //             }
    //             if (dig > 0 || this.useZero) {
    //                 result.push('' + dig);
    //             }
    //             else {
    //                 result.push(' ');
    //             }
    //         }
    //     }
    //     return result;
    // }

}
