import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { Account } from '../../model/account';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { confirmPassword, notEmpty } from '../../directives/validators.directive';
import { NgClass } from '@angular/common';
import { Button } from '../../model/button';
import { VerenigingKort } from '../../model/vereniging';

@Component({
    selector: 'app-account',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './account.component.html',
    styleUrl: './account.component.css'
})
export class AccountComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    helper = inject(HelperService);
    fb = inject(FormBuilder);

    account: Account = new Account();
    verenigingen: VerenigingKort[] = [];
    klassen: string[] = [];
    gewijzigd: boolean = false;

    buttons: Button[] = [new Button('Enter', 'Opslaan', true)];

    accountForm!: FormGroup;

    override escapePressed(): void {
        if (this.escapeCount != 0) {
            this.createAccountForm();
            this.gewijzigd = false;
            this.setEscapeCount();
            return;
        }
        super.escapePressed();
    }

    buttonPressed(button: Button) {
        if (button.key == 'Enter' && this.gewijzigd && this.accountForm && this.accountForm.valid) {
            button.selected = true;
            setTimeout(() => {
                button.selected = false;
                this.opslaanClicked();
            }, 300);
        }
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.opslaanClicked();
        }
    }

    opslaanClicked() {
        if (!(this.gewijzigd && this.accountForm && this.accountForm.valid)) {
            return;
        }
        const pw = this.helper.transform(this.passw?.value);
        if (pw != '') {
            this.account.password = pw;
        }
        if (this.verId?.value != this.account.verId) {
            this.account.verId = this.verId?.value;
        }
        if (this.klasse?.value != this.account.klasse) {
            this.account.klasse = this.klasse?.value;
        }
        this.bssApi.updateAccount(this.account)
        .then(resp => {
            this.alert.showAlert('Account succesvol gewijzigd.', 'success', 4);
            this.createAccountForm();
            this.gewijzigd = false;
            this.setEscapeCount();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    setGewijzigd() {
        this.gewijzigd = !(this.passw?.value == '' && this.verId?.value == this.account.verId && this.klasse?.value == this.account.klasse);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return false;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(this.buttons[0]);
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
        const id = this.appData.getLoginAccountId();
        if (!id || id == '') {
            this.router.navigate(['login']);
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
            passw: ['', [confirmPassword('passw2', true)]],
            passw2: ['', [confirmPassword('passw')]],
            verId: [this.account.verId],
            klasse: [this.account.klasse]
        });
        this.accountForm.controls['passw2'].disable();
        this.accountForm.controls['passw'].valueChanges.subscribe((val: string) => {
            if (val == '') {
                this.accountForm.controls['passw2'].setValue('');
                this.accountForm.controls['passw2'].disable();
            }
            else {
                this.accountForm.controls['passw2'].enable();
                if (val.length < 3) {
                    this.accountForm.controls['passw'].setErrors({invalidLength: true});
                }
                else {
                    this.accountForm.controls['passw'].setErrors(null);
                }
            }
            this.setGewijzigd();
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

    get passw() {
        return this.accountForm.get('passw');
    }
    get passw2() {
        return this.accountForm.get('passw2');
    }
    get verId() {
        return this.accountForm.get('verId');
    }
    get klasse() {
        return this.accountForm.get('klasse');
    }

}
