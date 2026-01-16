import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-annon-wide-info',
    standalone: true,
    imports: [
        DecimalPipe
    ],
    templateUrl: './annon-wide-info.component.html',
    styleUrl: './annon-wide-info.component.css'
})
export class AnnonWideInfoComponent {
    @Input() naam: string = '';
    @Input() moyenne: number = 0;
}
