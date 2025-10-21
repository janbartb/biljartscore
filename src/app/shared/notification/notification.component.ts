import { Component, Input } from '@angular/core';
import { ModalMessage } from '../../model/modal-message';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [NgClass],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.css'
})
export class NotificationComponent {
    @Input() modal: ModalMessage = new ModalMessage('', [], '', 0);
    @Input() type: string = 'vertical';
    @Input() kleur: string = 'white';
    @Input() spel: string = '';
}
