import { DecimalPipe, NgClass } from '@angular/common';
import { Component, effect, input } from '@angular/core';

@Component({
    selector: 'app-getal-heel',
    standalone: true,
    imports: [
        DecimalPipe,
        NgClass
    ],
    templateUrl: './getal-heel.component.html',
    styleUrl: './getal-heel.component.css'
})
export class GetalHeelComponent {
    getal = input(0);

    getalView: number = 0;
    getalCss: string = 'trans';

    constructor() {
        this.getalView = this.getal();
        effect(() => {
            const g = this.getal();
            if (g > this.getalView) {
                this.getalCss = 'getalUp';
                setTimeout(() => {
                    this.getalCss = 'notrans getalDown';
                    setTimeout(() => {
                        this.getalView = this.getal();
                        this.getalCss = '';
                    }, 200);                                        
                }, 200);
            }
            else {
                this.getalCss = 'getalDown';
                setTimeout(() => {
                    this.getalCss = 'notrans getalUp';
                    setTimeout(() => {
                        this.getalView = this.getal();
                        this.getalCss = '';
                    }, 200);                                        
                }, 200);
            }
        });
    }

}
