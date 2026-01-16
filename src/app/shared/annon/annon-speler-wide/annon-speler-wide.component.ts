import { Component, Input } from '@angular/core';
import { AnnonCat, AnnonSpeler } from '../../../model/annonceer';
import { NgClass } from '@angular/common';
import { AnnonWideInfoComponent } from '../annon-wide/annon-wide-info/annon-wide-info.component';
import { AnnonWideStandComponent } from '../annon-wide/annon-wide-stand/annon-wide-stand.component';
import { AnnonWideExtraComponent } from '../annon-wide/annon-wide-extra/annon-wide-extra.component';

@Component({
    selector: 'app-annon-speler-wide',
    standalone: true,
    imports: [
        AnnonWideInfoComponent,
        AnnonWideStandComponent,
        AnnonWideExtraComponent,
        NgClass
    ],
    templateUrl: './annon-speler-wide.component.html',
    styleUrl: './annon-speler-wide.component.css'
})
export class AnnonSpelerWideComponent {
    @Input() speler: AnnonSpeler = new AnnonSpeler(0);
    @Input() cats: AnnonCat[] = [];
    @Input() wedklaar: boolean = false;

}
