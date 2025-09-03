import { NgClass } from '@angular/common';
import { Component, effect, Input, input, OnInit } from '@angular/core';

@Component({
    selector: 'app-hgetal',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './hgetal.component.html',
    styleUrl: './hgetal.component.css'
})
export class HgetalComponent implements OnInit {
    getal = input('0');
    @Input() border: boolean = false;
    @Input() maxCijfers: number = 1;
    @Input() komma: boolean = false;
    breedte: string = '.61em';
    getal1: string = '0';
    getal2: string = '0';
    getalClasses: string[] = [];

    constructor() {
        effect(() => {
            const g = this.getal();
            if (g != this.getal1) {
                this.getal2 = g;
                this.getalClasses = ['move-up'];
                setTimeout(() => {
                    this.getalClasses = ['notrans'];
                    this.getal1 = this.getal2;
                }, 1000);
            }
        });
    }

    ngOnInit(): void {
        let b = .1 + (this.maxCijfers * .51) + (this.komma ? (1 / 6) : 0);
        this.breedte = b + 'em';
    }
}
