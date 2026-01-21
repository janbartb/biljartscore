import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { Wedstrijd } from '../../../model/wedstrijd';
import { ScoreComponent } from '../../../shared/score/score.component';

@Component({
    selector: 'app-wed-scorebord',
    standalone: true,
    imports: [
        ScoreComponent
    ],
    templateUrl: './wed-scorebord.component.html',
    styleUrl: './wed-scorebord.component.css'
})
export class WedScorebordComponent extends BaseComponent implements OnInit {
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedReady: boolean = false;

    override escapePressed(): void {
        this.router.navigate(['wedstrijd']);
    }

    handleKey(key: string) {
        if (key == 'Escape') {
            this.escapePressed();
        }
        else if (key == 'Lijst') {
            const toUrl = this.router.url.replace('score', 'lijst');
            this.appData.gotoPage(this.router.url, toUrl);
        }
    }

    ngOnInit(): void {
        this.bssApi.getWedstrijd()
        .then(resp => {
            if (!resp.gevonden) {
                console.log('Match niet gevonden. Vreemd...');
                this.router.navigate(['wedstrijd']);
                return;
            }
            this.wedstrijd = resp.wedstrijd;
            this.wedReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    saveWedstrijd(wed: Wedstrijd) {
        this.bssApi.saveWedstrijd(wed)
        .then(() => {})
        .catch(err => {
            this.alert.showError(err);
        });
    }

}
