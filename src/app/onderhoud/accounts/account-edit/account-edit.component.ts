import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HelperService } from '../../../services/helper.service';
import { Account } from '../../../model/account';
import { VerenigingKort } from '../../../model/vereniging';
import { Button } from '../../../model/button';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { Alinea, ConfirmDialog } from '../../../model/dialogs';
import { ConfirmComponent } from '../../../shared/confirm/confirm.component';

@Component({
    selector: 'app-account-edit',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        ConfirmComponent,
        ButtonComponent
    ],
    templateUrl: './account-edit.component.html',
    styleUrl: './account-edit.component.css'
})
export class AccountEditComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);
    fb = inject(FormBuilder);

    account: Account = new Account();
    verenigingen: VerenigingKort[] = [];
    klassen: string[] = [];
    rollen: string[] = ['gebruiker', 'beheerder'];
    gewijzigd: boolean = false;
    confirmPwResetDialog: ConfirmDialog = new ConfirmDialog('', []);

    buttons: Button[] = [
        new Button('Enter', 'Opslaan', true)
    ];
    pwResetButton: Button = new Button('', 'Reset wachtwoord', false);

    accountForm!: FormGroup;

    override escapePressed(): void {
        if (this.escapeCount == 1) {
            this.resetAccountForm();
            return;
        }
        super.escapePressed();
    }

    buttonPressed(idx: number) {
        this.buttons[idx].selected = true;
        setTimeout(() => {
            this.buttons[idx].selected = false;
            this.buttonClicked(idx);
        }, 500);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.opslaanClicked();
        }
    }

    pwResetButtonClicked() {
        if (!this.password || this.password.value == '') {
            return;
        }
        this.confirmPwReset();
    }

    private opslaanClicked() {
        if (!(this.gewijzigd && this.accountForm && this.accountForm.valid)) {
            return;
        }
        Object.assign(this.account, this.accountForm.value);
        this.bssApi.updateAccount(this.account)
        .then(resp => {
            this.alert.showAlert('Account succesvol gewijzigd.', 'success', 4);
            this.gewijzigd = false;
            this.setEscapeCount();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    resetAccountForm() {
        this.createAccountForm();
        this.gewijzigd = false;
        this.setEscapeCount();
    }

    setGewijzigd() {
        this.gewijzigd = !(this.role?.value == this.account.role && this.verId?.value == this.account.verId 
            && this.klasse?.value == this.account.klasse && this.password?.value == this.account.password);
        this.setEscapeCount();
    }

    private confirmPwReset() {
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Wachtwoord account '${this.account.userId}' resetten naar blanco.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmPwResetDialog = new ConfirmDialog('reset wachtwoord', inhoud);
        this.isDialogOpen = true;
    }

    confirmPwResetReplied(confirmed: boolean) {
        if (confirmed) {
            this.password?.setValue('');
            this.setGewijzigd();
        }
        this.isDialogOpen = false;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return false;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(0);
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }    
        return true;
    }

    ngOnInit(): void {
        const id: string | null = this.route.snapshot.paramMap.get('userId');
        if (!id) {
            this.alert.showError('Parameter <userId> niet gevonden in URL.');
            super.escapePressed();
            return;
        }
        Promise.all([
            this.bssApi.getAccount(id),
            this.bssApi.getVerenigingenKort(),
            this.bssApi.getMoyenneKlassenLijst(this.spelId)
        ])
        .then(results => {
            this.account = results[0];
            this.verenigingen = results[1];
            this.verenigingen.sort(this.compareVerenigingen);
            this.klassen = results[2];
            this.klassen.sort(this.compareKlassen);
            this.createAccountForm();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    private createAccountForm() {
        this.accountForm = this.fb.nonNullable.group({
            password: [this.account.password],
            role: [this.account.role, [Validators.required]],
            verId: [this.account.verId],
            klasse: [this.account.klasse]
        });
    }

    private compareVerenigingen(a: VerenigingKort, b: VerenigingKort): number {
        return (a.naam > b.naam) ? 1 : -1;
    }

    private compareKlassen(a: string, b: string): number {
        return (a > b) ? 1 : -1;
    }

    private setEscapeCount() {
        this.escapeCount = this.gewijzigd ? 1 : 0;
    }

    get password() {
        return this.accountForm.get('password');
    }
    get role() {
        return this.accountForm.get('role');
    }
    get verId() {
        return this.accountForm.get('verId');
    }
    get klasse() {
        return this.accountForm.get('klasse');
    }

}
