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
    @Input() maxCijfers: number = 1;

    getalOld: number = 0;
    cijfers: string[] = [];
    moveUp: boolean = true;

    constructor() {
        this.getalOld = this.getal();
        this.cijfers = this.getCijfers();
        effect(() => {
            const g = this.getal();
            this.moveUp = this.getal() >= this.getalOld;
            this.cijfers = this.getCijfers();
            this.getalOld = this.getal();
        });
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
