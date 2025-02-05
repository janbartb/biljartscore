import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Button } from '../../model/button';
import { ButtonComponent } from '../button-group/button/button.component';
import { ConfirmDialog } from '../../model/dialogs';

@Component({
    selector: 'app-confirm',
    standalone: true,
    imports: [
        ButtonComponent
    ],
    templateUrl: './confirm.component.html',
    styleUrl: './confirm.component.css'
})
export class ConfirmComponent implements OnInit, OnDestroy {
    @Input() dialog: ConfirmDialog = new ConfirmDialog('', []);
    @Output() reply: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() status: EventEmitter<boolean> = new EventEmitter<boolean>();
    title: string = '';

    buttonPressed(button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            switch (button.text) {
                case 'Ja':
                    this.acceptClicked();
                    break;
            
                case 'Nee':
                    this.rejectClicked();
                    break;
                
                default:
                    break;
            }
        }, 300);
    }

    acceptClicked() {
        this.reply.emit(true);
    }

    rejectClicked() {
        this.reply.emit(false);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.dialog.acceptButton);
            return false;
        }
        if (event.key === 'Escape') {
            this.buttonPressed(this.dialog.rejectButton);
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.title = 'Bevestig ' + this.dialog.actie;
        this.status.emit(true);
    }

    ngOnDestroy(): void {
        this.status.emit(false);
    }
}
