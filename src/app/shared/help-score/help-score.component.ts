import { Component, HostListener, inject } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-help-score',
    standalone: true,
    imports: [
        NgClass
    ],
    templateUrl: './help-score.component.html',
    styleUrl: './help-score.component.css'
})
export class HelpScoreComponent {
    alertService = inject(AlertService);
    activeTab: number = 0;

    activateTab(nr: number, event: MouseEvent) {
        event.stopPropagation();
        if (nr == this.activeTab) {
            return;
        }
        this.activeTab = nr;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydownEvent(event: KeyboardEvent): boolean {
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        return true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event);
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            event.preventDefault();
            event.stopPropagation();
            if (event.key === 'ArrowUp') {
                this.switchActiveTab(-1);
            }
            if (event.key === 'ArrowDown') {
                this.switchActiveTab(1);
            }
            return false;
        }
        return true;
    }

    private switchActiveTab(direction: number) {
        let idx = this.activeTab + (direction < 0 ? -1 : 1);
        if (idx < 0) {
            idx = 1;
        }
        if (idx > 1) {
            idx = 0;
        }
        this.activeTab = idx;
    }
    
}
