import { Component, Input } from '@angular/core';
import { AnnonCat, AnnonGrid, AnnonSpelerStand } from '../../../../model/annonceer';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-annon-speler-stand',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './annon-speler-stand.component.html',
    styleUrl: './annon-speler-stand.component.css'
})
export class AnnonSpelerStandComponent {
    @Input() actief: boolean = false;
    @Input() cats: AnnonCat[] = [];
    @Input() grid: AnnonGrid = new AnnonGrid();
    @Input() stand: AnnonSpelerStand = new AnnonSpelerStand(0);
    @Input() tsCar: number = 0;
    @Input() tsCarArr: number[] = [];
    @Input() wedklaar: boolean = false;
    @Input() isTeamWed: boolean = false;
}
