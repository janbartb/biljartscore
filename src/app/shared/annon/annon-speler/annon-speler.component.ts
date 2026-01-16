import { Component, Input } from '@angular/core';
import { AnnonCat, AnnonSpeler } from '../../../model/annonceer';
import { NgClass } from '@angular/common';
import { AnnonSpelerInfoComponent } from './annon-speler-info/annon-speler-info.component';
import { AnnonSpelerStandComponent } from './annon-speler-stand/annon-speler-stand.component';
import { AnnonSpelerExtraComponent } from './annon-speler-extra/annon-speler-extra.component';

@Component({
    selector: 'app-annon-speler',
    standalone: true,
    imports: [
        AnnonSpelerInfoComponent,
        AnnonSpelerStandComponent,
        AnnonSpelerExtraComponent,
        NgClass
    ],
    templateUrl: './annon-speler.component.html',
    styleUrl: './annon-speler.component.css'
})
export class AnnonSpelerComponent {
    @Input() speler: AnnonSpeler = new AnnonSpeler(0);
    @Input() cats: AnnonCat[] = [];
    @Input() isTeamWed: boolean = false;
    @Input() wedklaar: boolean = false;

}
