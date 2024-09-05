import { Component, inject } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgClass],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent {
    alertService = inject(AlertService);
}
