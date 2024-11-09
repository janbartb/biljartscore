import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-section-header',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './section-header.component.html',
    styleUrl: './section-header.component.css'
})
export class SectionHeaderComponent {
    @Input() title: string = '';
    @Input() active: boolean = false;
    @Input() cssClasses: string | string[] = '';
}
