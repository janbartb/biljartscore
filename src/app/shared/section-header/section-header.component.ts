import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

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
    @Input() id: number = -1;
    @Input() title: string = '';
    @Input() active: boolean = false;
    @Input() cssClasses: string | string[] = '';
    @Output() headerClicked: EventEmitter<number> = new EventEmitter<number>();

    clicked() {
        this.headerClicked.emit(this.id);
    }
}
