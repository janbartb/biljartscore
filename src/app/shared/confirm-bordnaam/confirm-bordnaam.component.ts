import { Component, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ButtonComponent } from '../button-group/button/button.component';
import { Button } from '../../model/button';
import { ConfirmSplBordNaamDialog } from '../../model/dialogs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates, notEmpty } from '../../directives/validators.directive';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-confirm-bordnaam',
    standalone: true,
    imports: [
        ButtonComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './confirm-bordnaam.component.html',
    styleUrl: './confirm-bordnaam.component.css'
})
export class ConfirmBordnaamComponent implements OnInit, OnDestroy {
    fb = inject(FormBuilder);
    @Input() dialog!: ConfirmSplBordNaamDialog;
    @Output() reply: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() status: EventEmitter<boolean> = new EventEmitter<boolean>();
    title: string = '';

    nameForm!: FormGroup;

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
        this.dialog.naam = this.naam?.value;
        this.reply.emit(true);
    }

    rejectClicked() {
        this.reply.emit(false);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter' && this.nameForm.valid) {
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
        this.title = 'Speler toevoegen';
        this.createForm();
        this.status.emit(true);
    }

    createForm() {
        this.nameForm = this.fb.nonNullable.group({
            naam: [this.dialog.speler.speler.bordnaam, [Validators.required, notEmpty(), noDuplicates(this.dialog.existingNames)]]
        });
    }

    get naam() {
        return this.nameForm?.get('naam');
    }

    ngOnDestroy(): void {
        this.status.emit(false);
    }

}
