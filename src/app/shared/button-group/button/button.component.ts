import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Button } from '../../../model/button';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
    @Input() button: Button = new Button('', '');
    @Input() selected: boolean = false;
    @Output() buttonClicked: EventEmitter<string> = new EventEmitter<string>();

    clicked() {
        if (!this.button.disabled) {
            this.buttonClicked.emit(this.button.key);
        }
    }
}
