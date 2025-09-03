import { Component, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { BaseComponent } from '../base/base.component';
import { formatNumber } from '@angular/common';
import { HgetalComponent } from "./hgetal/hgetal.component";

@Component({
    selector: 'app-tryout',
    standalone: true,
    imports: [
        PageHeaderComponent,
        HgetalComponent
    ],
    templateUrl: './tryout.component.html',
    styleUrl: './tryout.component.css'
})
export class TryoutComponent extends BaseComponent implements OnInit {
    waarde: number = 0;
    getal: string = '0';

    fillGetal() {
        this.getal = formatNumber(this.waarde, 'nl-NL', '1.3-3');
        this.getal = '' + this.waarde;
    }

    increase() {
        this.waarde += 22;
        this.fillGetal();
    }

    ngOnInit(): void {
        this.fillGetal();
        setTimeout(() => {
            this.increase();
        }, 2000);
    }
}
