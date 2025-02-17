import { Component, inject } from '@angular/core';
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
}
