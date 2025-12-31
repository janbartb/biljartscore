import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { NgClass } from '@angular/common';
import { confirmPassword, notEmpty } from '../../../directives/validators.directive';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../../services/helper.service';
import { Account } from '../../../model/account';
import { Button } from '../../../model/button';
import { BaseComponent } from '../../../base/base.component';

@Component({
    selector: 'app-account-reset',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ReactiveFormsModule,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './account-reset.component.html',
    styleUrl: './account-reset.component.css'
})
export class AccountResetComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);
    fb = inject(FormBuilder);

    title: string = 'Reset wachtwoord';
    account: Account = new Account();

    buttonResetOpslaan: Button = new Button('Enter', 'Opslaan', true);
    buttonResetCancel: Button = new Button('Esc', 'Annuleer', true);

    pwResetForm!: FormGroup;

    buttonPressed(button: Button) {
        if (button.key == 'Enter' && !(this.pwResetForm && this.pwResetForm.valid)) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.resetOpslaanClicked();
            }
            else {
                this.resetCancelClicked();
            }
        }, 300);
    }

    resetCancelClicked() {
        this.router.navigate(['login']);
    }

    resetOpslaanClicked() {
        const pw = this.helper.transform(this.pwResetForm.controls['pw1'].value);
        this.account.password = pw;
        this.bssApi.updateAccount(this.account)
        .then(resp => {
            this.alert.showAlert('Account succesvol gewijzigd.', 'success', 4);
            localStorage.setItem('bssLoginId', this.account.userId);
            this.router.navigate(['login']);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.buttonResetOpslaan);
            return false;
        }
        if (event.key === 'Escape') {
            this.buttonPressed(this.buttonResetCancel);
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        let id = '';
        if (this.route.snapshot.paramMap.has('userId')) {
            id = this.route.snapshot.paramMap.get('userId') || '';
        }
        if (id == '') {
            this.router.navigate(['login']);
            return;
        }
        this.bssApi.getAccount(id)
        .then(result => {
            this.account = result;
            if (this.account.password != '') {
                this.router.navigate(['login']);
                return;
            }
            this.title += ` account '${this.account.userId}'`;
            this.createPwResetForm();
        })
        .catch(err => {
            let errTxt = err + '';
            if (errTxt.includes('niet gevonden')) {
                this.alert.showError(`ERROR wachtwoord reset: account met id '${id}' niet gevonden.`);
                this.router.navigate(['login']);
            }
        });
    }

    private createPwResetForm() {
        this.pwResetForm = this.fb.nonNullable.group({
            pw1: ['', [Validators.required, Validators.minLength(3), notEmpty(), confirmPassword('pw2', true)]],
            pw2: ['', [Validators.required, Validators.minLength(3), notEmpty(), confirmPassword('pw1')]]
        });
    }

}
