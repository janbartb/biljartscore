import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button } from '../../model/button';
import { ButtonComponent } from '../button-group/button/button.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-section-footer-btns',
    standalone: true,
    imports: [
        ButtonComponent,
        NgClass
    ],
    templateUrl: './section-footer-btns.component.html',
    styleUrl: './section-footer-btns.component.css'
})
export class SectionFooterBtnsComponent implements OnInit {
    @Input() buttons: Button[] = [];
    @Input() btnsHide: boolean[] = [];
    @Input() btnsDisabled: boolean[] = [];
    @Input() cssFooter: string | string[] = '';
    @Input() cssButtons: string | string[] = '';
    @Output() clickedButton: EventEmitter<number> = new EventEmitter<number>();

    buttonClicked(idx: number) {
        this.clickedButton.emit(idx);
    }

    ngOnInit(): void {
        if (this.btnsHide.length == 0) {
            this.buttons.forEach(_ => this.btnsHide.push(false));
        }
        if (this.btnsDisabled.length == 0) {
            this.buttons.forEach(_ => this.btnsDisabled.push(false));
        }
    }
}
