import { Component, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { BaseComponent } from '../base/base.component';
import { GetalComponent } from '../shared/getal/getal.component';
import { Cijfer2Component } from './cijfer2/cijfer2.component';
import { Getal2Component } from './getal2/getal2.component';

@Component({
    selector: 'app-tryout',
    standalone: true,
    imports: [
        PageHeaderComponent,
        Getal2Component
    ],
    templateUrl: './tryout.component.html',
    styleUrl: './tryout.component.css'
})
export class TryoutComponent extends BaseComponent implements OnInit {
    getal: number = 0;
    maxCijfers: number = 3;

    increaseVal() {
        this.getal += 10;
    }

    decreaseVal() {
        this.getal--;
    }

    ngOnInit(): void {
        this.getal = 0;
    }
}
