import { Component, Input, OnInit } from '@angular/core';
import { Lokaliteit, Vereniging } from '../../../../model/vereniging';
import { BaseComponent } from '../../../../base/base.component';

@Component({
    selector: 'app-vereniging-view',
    standalone: true,
    imports: [],
    templateUrl: './vereniging-view.component.html',
    styleUrl: './vereniging-view.component.css'
})
export class VerenigingViewComponent extends BaseComponent implements OnInit {
    @Input() vereniging: Vereniging = new Vereniging();

    lokaliteit: Lokaliteit = new Lokaliteit();

    ngOnInit(): void {
        this.bssApi.getLokaliteit(this.vereniging.locatie)
        .then(result => {
            this.lokaliteit = result;
        })
        .catch((err) => {
            this.alert.showAlert(err, 'error');
        });
    }

}
