import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Button } from '../../../model/button';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent implements OnInit {
    @Input() button: Button = new Button('', '');
    @Input() disabled: boolean = false;
    @Output() buttonClicked: EventEmitter<string> = new EventEmitter<string>();

    clicked() {
        if (!(this.button.disabled || this.disabled)) {
            this.buttonClicked.emit(this.button.key);
        }
    }

    ngOnInit(): void {
        this.button.show();
    }
}
