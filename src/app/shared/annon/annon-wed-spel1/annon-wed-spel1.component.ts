import { Component, Input } from '@angular/core';
import { AnnonSpelerWideComponent } from '../annon-speler-wide/annon-speler-wide.component';
import { Annonceer } from '../../../model/annonceer';

@Component({
    selector: 'app-annon-wed-spel1',
    standalone: true,
    imports: [
        AnnonSpelerWideComponent
    ],
    templateUrl: './annon-wed-spel1.component.html',
    styleUrl: './annon-wed-spel1.component.css'
})
export class AnnonWedSpel1Component {
    @Input() wedstrijd: Annonceer = new Annonceer();
}
