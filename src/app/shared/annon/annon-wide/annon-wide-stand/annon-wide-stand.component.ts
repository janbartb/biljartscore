import { Component, Input } from '@angular/core';
import { AnnonCat, AnnonGrid, AnnonSpelerStand } from '../../../../model/annonceer';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-annon-wide-stand',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './annon-wide-stand.component.html',
    styleUrl: './annon-wide-stand.component.css'
})
export class AnnonWideStandComponent {
    @Input() actief: boolean = false;
    @Input() cats: AnnonCat[] = [];
    @Input() grid: AnnonGrid = new AnnonGrid();
    @Input() stand: AnnonSpelerStand = new AnnonSpelerStand(0);
    @Input() tsCar: number = 0;
    @Input() tsCarArr: number[] = [];
    @Input() wedklaar: boolean = false;

}
