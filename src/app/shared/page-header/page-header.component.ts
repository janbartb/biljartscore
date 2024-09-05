import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css'
})
export class PageHeaderComponent {
    private router = inject(Router);

    @Input() title: string = '';
    @Input() subtitle: string = '';
    @Input() previousUrl: string = 'home'

    gotoHome() {
        this.router.navigate(['home']);
    }

    gotoPrevious() {
        this.router.navigate([this.previousUrl]);
    }
}
