import { Component, Input } from '@angular/core';
import { AnnonSpelerWideComponent } from '../annon-speler-wide/annon-speler-wide.component';
import { Annonceer } from '../../../model/annonceer';

@Component({
    selector: 'app-annon-wed-spel3',
    standalone: true,
    imports: [
        AnnonSpelerWideComponent
    ],
    templateUrl: './annon-wed-spel3.component.html',
    styleUrl: './annon-wed-spel3.component.css'
})
export class AnnonWedSpel3Component {
    @Input() wedstrijd: Annonceer = new Annonceer();
}
