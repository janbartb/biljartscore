import { Component, Input } from '@angular/core';
import { Annonceer, AnnonSpeler } from '../../../model/annonceer';
import { AnnonSpelerComponent } from '../annon-speler/annon-speler.component';

@Component({
    selector: 'app-annon-wed-spel2',
    standalone: true,
    imports: [
        AnnonSpelerComponent
    ],
    templateUrl: './annon-wed-spel2.component.html',
    styleUrl: './annon-wed-spel2.component.css'
})
export class AnnonWedSpel2Component {
    @Input() wedstrijd: Annonceer = new Annonceer();
    @Input() speler: AnnonSpeler = new AnnonSpeler(0);
    @Input() tegenstander: AnnonSpeler = new AnnonSpeler(0);
}
