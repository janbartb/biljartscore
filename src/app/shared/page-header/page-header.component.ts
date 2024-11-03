import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../base/base.component';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {
    router = inject(Router);
    appData = inject(StatusService);

    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() spel: string = this.appData.getSpelNaam();
    @Input() district: string = '';

    gotoHome() {
        this.router.navigate(['home']);
    }

}
