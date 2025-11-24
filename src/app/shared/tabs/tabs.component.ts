import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-tabs',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './tabs.component.html',
    styleUrl: './tabs.component.css'
})
export class TabsComponent implements OnInit {
    @Input() tabs: string[] = [];
    @Input() tabWidths: string[] = [];  // tab widths in %
    @Input() colorClass: string = 'w3-green-tab';
    @Input() idxActive: number = 0;
    @Output() tabSelected: EventEmitter<number> = new EventEmitter<number>();

    tabClicked(idx: number) {
        this.tabSelected.emit(idx);
    }

    ngOnInit(): void {
        if (!this.tabs.length) {
            this.tabs.push('No tabs provided');
            this.tabWidths.push('100%');
            return;
        }
        if (this.tabs.length > 5) {
            this.tabs.push('Too many tabs provided');
            this.tabWidths.push('100%');
            return;
        }
        if (this.tabWidths.length != this.tabs.length) {
            if (this.tabs.length == 3) {
                this.tabWidths = ['33.5%', '33.5%', '33%'];
            }
            else {
                this.tabWidths = [];
                const wdth = 100 / this.tabs.length;
                this.tabs.forEach(() => this.tabWidths.push(wdth + '%'));
            }
        }
    }
}
