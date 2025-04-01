import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ButtonComponent } from '../button-group/button/button.component';
import { Button } from '../../model/button';
import { ConfirmEndOfMatchDialog } from '../../model/dialogs';

@Component({
    selector: 'app-confirm-end-of-match',
    standalone: true,
    imports: [
        ButtonComponent
    ],
    templateUrl: './confirm-end-of-match.component.html',
    styleUrl: './confirm-end-of-match.component.css'
})
export class ConfirmEndOfMatchComponent implements OnInit, OnDestroy {
    @Input() dialog: ConfirmEndOfMatchDialog = new ConfirmEndOfMatchDialog();
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
        //this.title = 'Bevestig ' + this.dialog.actie;
        this.status.emit(true);
    }

    ngOnDestroy(): void {
        this.status.emit(false);
    }

}
