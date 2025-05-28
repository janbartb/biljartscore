import { Component, OnInit } from '@angular/core';
import { AnnonScoreComponent } from '../../../shared/annon-score/annon-score.component';
import { BaseComponent } from '../../../base/base.component';
import { Annonceer } from '../../../model/annonceer';

@Component({
    selector: 'app-annon-scorebord',
    standalone: true,
    imports: [
        AnnonScoreComponent
    ],
    templateUrl: './annon-scorebord.component.html',
    styleUrl: './annon-scorebord.component.css'
})
export class AnnonScorebordComponent extends BaseComponent implements OnInit {
    annon: Annonceer = new Annonceer();
    wedReady: boolean = false;

    override escapePressed(): void {
        this.router.navigate(['annon']);
    }

    handleKey(key: string) {
        if (key == 'Escape') {
            this.escapePressed();
        }
    }

    updateAndSaveAnnonWed(wed: Annonceer) {
        this.saveAnnonWed(wed);
    }

    ngOnInit(): void {
        this.bssApi.getAnnonWedstrijd()
        .then(resp => {
            if (!resp.gevonden) {
                console.log('Annonceer wedstrijd niet gevonden. Vreemd...');
                this.router.navigate(['annon']);
                return;
            }
            this.annon = resp.annon;
            this.wedReady = true;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private saveAnnonWed(wed: Annonceer) {
        this.bssApi.saveAnnonWedstrijd(wed)
        .then(() => {})
        .catch(err => {
            this.alert.showError(err);
        });
    }

}
