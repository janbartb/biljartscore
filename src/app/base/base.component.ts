import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [],
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent {
    bssApi = inject(ApiService);
    alert = inject(AlertService);
    router = inject(Router);

    previousUrl: string = '';

    homePressed() {
        this.router.navigate(['home']);
    }

    escapePressed() {
        this.router.navigate([this.previousUrl]);
    }

}
