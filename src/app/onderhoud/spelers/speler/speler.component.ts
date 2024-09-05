import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Speler } from '../../../model/speler';
import { ApiService } from '../../../services/api.service';
import { AlertService } from '../../../services/alert.service';
import { BaseComponent } from '../../../base/base.component';

@Component({
  selector: 'app-speler',
  standalone: true,
  imports: [],
  templateUrl: './speler.component.html',
  styleUrl: './speler.component.css'
})
export class SpelerComponent extends BaseComponent {
    route = inject(ActivatedRoute);

    speler: Speler = new Speler();

    ngOnInit(): void {
        const id: string | null = this.route.snapshot.paramMap.get('spelerId');
        if (id && id != 'toevoegen') {
            this.bssApi.getSpeler(id)
            .then((result: Speler) => {
                this.speler = result;
                console.log(this.speler);
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
        }
        else {
            console.log(this.speler);
        }
    }

}
