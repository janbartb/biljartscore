import { Component, inject, Input } from '@angular/core';
import { AlertService } from '../../services/alert.service';

@Component({
    selector: 'app-help',
    standalone: true,
    imports: [],
    templateUrl: './help.component.html',
    styleUrl: './help.component.css'
})
export class HelpComponent {
    alertService = inject(AlertService);

    @Input() title = 'BSS Help';
}
