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
    cijfer = input('');
    @Input() moveUp: boolean = true;
    cijferView: string = '';

    cijferCss: string = 'trans';

    constructor() {
        this.cijferView = this.cijfer();
        effect(() => {
            const d = this.cijfer();
            if (this.moveUp) {
                this.cijferCss = 'cijferUp';
                setTimeout(() => {
                    this.cijferCss = 'notrans cijferDown';
                    setTimeout(() => {
                        this.cijferView = this.cijfer();
                        this.cijferCss = '';
                    }, 200);                                        
                }, 200);
            }
            else {
                this.cijferCss = 'cijferDown';
                setTimeout(() => {
                    this.cijferCss = 'notrans cijferUp';
                    setTimeout(() => {
                        this.cijferView = this.cijfer();
                        this.cijferCss = '';
                    }, 200);                                        
                }, 200);
            }
        });
    }

}
