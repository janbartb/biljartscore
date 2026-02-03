import { NgClass } from '@angular/common';
import { Component, effect, Input, input } from '@angular/core';

@Component({
    selector: 'app-cijfer',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './cijfer.component.html',
    styleUrl: './cijfer.component.css'
})
export class CijferComponent {
    cijfer = input(' ');
    @Input() isSerie: boolean = false;
    @Input() useZero: boolean = true;
    @Input() moveUp: boolean = true;
    @Input() cijferWidth: number = .53125;
    //top: number = 0;
    cijferRol: string[] = [' ', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    oldCijfer: string = ' ';
    cijfersCss: string[] = ['cijfers', 'plus0', ''];
    //firstTime: boolean = true;

    constructor() {
        effect(() => {
            const d = this.cijfer();
            if (this.moveUp) {
                this.moveDigitUp(d);
            }
            else {
                this.moveDigitDown(d);
            }
        });
    }

    private moveDigitUp(digit: string) {
        this.cijfersCss[2] = '';
        this.cijferRol = this.getUpCijferRol(this.oldCijfer);
        const idx = this.cijferRol.findIndex(dig => dig == digit);
        this.cijfersCss[1] = 'plus' + idx;
        setTimeout(() => {
            this.cijfersCss[2] = 'notrans';
            this.cijferRol = this.getUpCijferRol(digit);
            this.cijfersCss[1] = 'plus0';
            this.oldCijfer = digit;
        }, 2000);
    }

    private moveDigitDown(digit: string) {
        this.cijfersCss[2] = 'notrans';
        this.cijferRol = this.getDownCijferRol(this.oldCijfer);
        this.cijfersCss[1] = 'min0';
        setTimeout(() => {
            this.cijfersCss[2] = '';
            const idx = this.cijferRol.findIndex(dig => dig == digit);
            this.cijfersCss[1] = 'min' + (9 - idx);
            setTimeout(() => {
                this.cijfersCss[2] = 'notrans';
                this.cijferRol = this.getUpCijferRol(digit);
                this.cijfersCss[1] = 'plus0';
                this.oldCijfer = digit;
            }, 2000);
        }, 250);
    }

    private getUpCijferRol(start: string): string[] {
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

    private getDownCijferRol(start: string): string[] {
        let result: string[] = [];
        const startDigit = (start == ' ') ? 0 : parseInt(start);
        for (let i = 1; i < 11; i++) {
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

}
