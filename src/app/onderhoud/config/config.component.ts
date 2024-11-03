import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Config } from '../../model/config';
import { ApiResponse } from '../../model/api-response';
import { AlertService } from '../../services/alert.service';
import { BaseComponent } from '../../base/base.component';

@Component({
    selector: 'app-config',
    standalone: true,
    imports: [],
    templateUrl: './config.component.html',
    styleUrl: './config.component.css'
})
export class ConfigComponent extends BaseComponent implements OnInit {
    config: Config = new Config();

    ngOnInit(): void {
        this.bssApi.getConfig()
            .then((resp: Config) => {
                this.config = resp;
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            })
    }
}
