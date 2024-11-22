import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { ApiService } from '../services/api.service';
import { FormGroup, Validators } from '@angular/forms';
import { StatusService } from '../services/status.service';

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [],
  templateUrl: './base.component.html',
  styleUrl: './base.component.css'
})
export class BaseComponent {
    bssApi = inject(ApiService);
    appData = inject(StatusService);
    alert = inject(AlertService);
    router = inject(Router);

    spelId: string = this.appData.getSpelId();

    // if a dialog is open set this to true to ignore the component @HostListener
    isDialogOpen: boolean = false;

    homePressed() {
        this.router.navigate(['home']);
    }

    escapePressed() {
        this.appData.previousPage();
    }

    gotoOnderhoud() {
        this.router.navigate(['onderhoud']);
    }

    isRequired(form: FormGroup, field: string): boolean {
        if (!form) return false;
        return form.controls[field]?.hasValidator(Validators.required);
    }

}
