import { Component, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Button } from '../../model/button';
import { MatchSpelerDialog, WedSpelerDialog } from '../../model/dialogs';
import { MatchSpeler } from '../../model/match';
import { ButtonComponent } from '../button-group/button/button.component';
import { SpeechService } from '../../services/speech.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { notEmpty } from '../../directives/validators.directive';

@Component({
    selector: 'app-speler-namen',
    standalone: true,
    imports: [
        ButtonComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './speler-namen.component.html',
    styleUrl: './speler-namen.component.css'
})
export class SpelerNamenComponent implements OnInit, OnDestroy {
    spraak = inject(SpeechService);
    fb = inject(FormBuilder);

    @Input() dialog!: MatchSpelerDialog | WedSpelerDialog;
    //@Input() dialog: MatchSpelerDialog = new MatchSpelerDialog(new MatchSpeler());
    @Output() reply: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() status: EventEmitter<boolean> = new EventEmitter<boolean>();
    title: string = '';

    namenForm!: FormGroup | null;

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
        if (this.namenForm && this.namenForm.valid) {
            this.dialog.speler.splBordNaam = this.bordNaam?.value;
            this.dialog.speler.splSpreekNaam = this.spreekNaam?.value;
            this.reply.emit(true);
        }
    }

    rejectClicked() {
        this.reply.emit(false);
    }

    spreekClicked() {
        const naam = (this.spreekNaam?.value.trim().length) ? this.spreekNaam?.value.trim() : '';
        if (naam != '') {
            this.spraak.speak(naam);
        }
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
        if (event.code == 'Space' && event.ctrlKey) {
            this.spreekClicked();
        }
        return true;
    }

    ngOnInit(): void {
        this.title = 'Wijzig speler naam';
        this.createForm();
        this.status.emit(true);
    }

    ngOnDestroy(): void {
        this.status.emit(false);
    }

    private createForm() {
        this.namenForm = this.fb.nonNullable.group({
            bordNaam: [this.dialog.speler.splBordNaam, [Validators.required, notEmpty()]],
            spreekNaam: [this.dialog.speler.splSpreekNaam, [Validators.required, notEmpty()]],
        });
    }

    get bordNaam() {
        return this.namenForm?.get('bordNaam');
    }
    get spreekNaam() {
        return this.namenForm?.get('spreekNaam');
    }
}
