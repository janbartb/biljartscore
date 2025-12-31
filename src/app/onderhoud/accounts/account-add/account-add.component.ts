import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { HelperService } from '../../../services/helper.service';
import { Account } from '../../../model/account';
import { BaseComponent } from '../../../base/base.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates, notEmpty } from '../../../directives/validators.directive';
import { VerenigingKort } from '../../../model/vereniging';
import { Button } from '../../../model/button';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-account-add',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './account-add.component.html',
    styleUrl: './account-add.component.css'
})
export class AccountAddComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);
    fb = inject(FormBuilder);

    account: Account = new Account();
    existingIds: string[] = [];
    verenigingen: VerenigingKort[] = [];
    klassen: string[] = [];
    rollen: string[] = ['gebruiker', 'beheerder'];

    buttons: Button[] = [
        new Button('Enter', 'Opslaan', true)
    ];

    accountForm!: FormGroup;

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

    private opslaanClicked() {
        if (!(this.accountForm && this.accountForm.valid)) {
            return;
        }
        Object.assign(this.account, this.accountForm.value);
        const pw = this.helper.transform(this.account.password);
        this.account.password = pw;
        this.bssApi.addAccount(this.account)
        .then(resp => {
            this.alert.showAlert('Account succesvol toegevoegd.', 'success', 4);
            super.escapePressed();
        })
        .catch(err => {
            this.alert.showError(err);
        })
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
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
        Promise.all([
            this.bssApi.getAccounts(),
            this.bssApi.getVerenigingenKort(),
            this.bssApi.getMoyenneKlassenLijst(this.spelId)
        ])
        .then(results => {
            this.existingIds = results[0].map(acc => acc.userId);
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
            userId: [this.account.userId, [Validators.required, notEmpty(), noDuplicates(this.existingIds)]],
            password: ['', [Validators.required, notEmpty(), Validators.minLength(3)]],
            role: ['gebruiker', [Validators.required]],
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

    get userId() {
        return this.accountForm.get('userId');
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
