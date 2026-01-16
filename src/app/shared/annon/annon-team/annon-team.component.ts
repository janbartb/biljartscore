import { Component, Input } from '@angular/core';
import { AnnonWideInfoComponent } from '../annon-wide/annon-wide-info/annon-wide-info.component';
import { AnnonWideStandComponent } from '../annon-wide/annon-wide-stand/annon-wide-stand.component';
import { AnnonWideExtraComponent } from '../annon-wide/annon-wide-extra/annon-wide-extra.component';
import { NgClass } from '@angular/common';
import { AnnonCat, AnnonTeam } from '../../../model/annonceer';

@Component({
    selector: 'app-annon-team',
    standalone: true,
    imports: [
        AnnonWideInfoComponent,
        AnnonWideStandComponent,
        AnnonWideExtraComponent,
        NgClass
    ],
    templateUrl: './annon-team.component.html',
    styleUrl: './annon-team.component.css'
})
export class AnnonTeamComponent {
    @Input() team: AnnonTeam = new AnnonTeam(0);
    @Input() cats: AnnonCat[] = [];
    @Input() wedklaar: boolean = false;

}
