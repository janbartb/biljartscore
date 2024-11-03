import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertComponent } from "./shared/alert/alert.component";
import { registerLocaleData } from '@angular/common';
import localeNl from '@angular/common/locales/nl';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, AlertComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
    title = 'biljartscore';
    
    ngOnInit(): void {
        registerLocaleData(localeNl);
    }

}
