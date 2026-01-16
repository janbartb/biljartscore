import { Component, Input } from '@angular/core';
import { Annonceer } from '../../../model/annonceer';
import { AnnonSpelerWideComponent } from '../annon-speler-wide/annon-speler-wide.component';

@Component({
    selector: 'app-annon-wed-spel4',
    standalone: true,
    imports: [
        AnnonSpelerWideComponent
    ],
    templateUrl: './annon-wed-spel4.component.html',
    styleUrl: './annon-wed-spel4.component.css'
})
export class AnnonWedSpel4Component {
    @Input() wedstrijd: Annonceer = new Annonceer();
}
