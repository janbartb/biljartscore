import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-error-page',
    standalone: true,
    imports: [],
    templateUrl: './error-page.component.html',
    styleUrl: './error-page.component.css'
})
export class ErrorPageComponent implements OnInit {
    router = inject(Router);
    errMsg: string = 'ERROR';

    ngOnInit(): void {
        let errMode = (this.router.url.includes('config')) ? 'config' : 'illegal';
        if (errMode == 'config') {
            this.errMsg = 'Configuratie bestand niet gevonden !';
        }
        else {
            this.errMsg = 'U gebruikt een illegale versie van dit programma !';
        }
    }
}
