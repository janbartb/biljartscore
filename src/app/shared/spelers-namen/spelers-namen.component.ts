import { Component, EventEmitter, HostListener, inject, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button-group/button/button.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { SpeechService } from '../../services/speech.service';
import { SpelerNamen, SpelerNamenDialog } from '../../model/dialogs';
import { Button } from '../../model/button';
import { notEmpty } from '../../directives/validators.directive';
import { List } from '../../model/list';

@Component({
    selector: 'app-spelers-namen',
    standalone: true,
    imports: [
        ButtonComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './spelers-namen.component.html',
    styleUrl: './spelers-namen.component.css'
})
export class SpelersNamenComponent {
    spraak = inject(SpeechService);
    fb = inject(FormBuilder);

    @Input() dialog!: SpelerNamenDialog;
    @Output() reply: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() status: EventEmitter<boolean> = new EventEmitter<boolean>();
    spelerLijst: List<SpelerNamen> = new List<SpelerNamen>();
    dialogReady: boolean = false;

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

    spelerClicked(idx: number) {
        if (!this.namenForm || !this.namenForm.valid) {
            return;
        }
        this.verwerkWijzigingen();
        this.spelerLijst.selectedIdx = idx;
        this.createForm();
    }

    acceptClicked() {
        if (this.namenForm && this.namenForm.valid) {
            this.verwerkWijzigingen();
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

    private verwerkWijzigingen() {
        this.spelerLijst.items[this.spelerLijst.selectedIdx].splBordNaam = this.bordNaam?.value;
        this.spelerLijst.items[this.spelerLijst.selectedIdx].splSpreekNaam = this.spreekNaam?.value;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (!this.namenForm || !this.namenForm.valid) {
                return true;
            }
            this.verwerkWijzigingen();
            if (event.key === 'ArrowUp') {
                this.spelerLijst.selectPreviousItem();
                this.createForm();
                return false;
            }
            if (event.key === 'ArrowDown') {
                this.spelerLijst.selectNextItem();
                this.createForm();
                return false;
            }
            return true;
        }
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
        this.spelerLijst.fillItems(this.dialog.spelers);
        this.spelerLijst.selectedIdx = this.spelerLijst.items.findIndex(spl => spl.splId == this.dialog.selSpelerId);
        if (this.spelerLijst.selectedIdx < 0) {
            this.spelerLijst.selectedIdx = 0;
        }
        this.createForm();
        this.status.emit(true);
        this.dialogReady = true;
    }

    ngOnDestroy(): void {
        this.status.emit(false);
    }

    private createForm() {
        this.namenForm = this.fb.nonNullable.group({
            bordNaam: [this.spelerLijst.items[this.spelerLijst.selectedIdx].splBordNaam, [Validators.required, notEmpty()]],
            spreekNaam: [this.spelerLijst.items[this.spelerLijst.selectedIdx].splSpreekNaam, [Validators.required, notEmpty()]],
        });
    }

    get bordNaam() {
        return this.namenForm?.get('bordNaam');
    }
    get spreekNaam() {
        return this.namenForm?.get('spreekNaam');
    }

}
