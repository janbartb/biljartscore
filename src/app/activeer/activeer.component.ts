import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { Account } from '../model/account';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../model/button';
import { VerenigingKort } from '../model/vereniging';
import { notEmpty } from '../directives/validators.directive';
import { HelperService } from '../services/helper.service';
import { SectionFooterBtnsComponent } from '../shared/section-footer-btns/section-footer-btns.component';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-activeer',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ReactiveFormsModule,
        SectionFooterBtnsComponent,
        NgClass
    ],
    templateUrl: './activeer.component.html',
    styleUrl: './activeer.component.css'
})
export class ActiveerComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);
    helper = inject(HelperService);
    account: Account = new Account();
    verenigingen: VerenigingKort[] = [];
    klassen: string[] = [];

    buttons: Button[] = [new Button('Enter', 'Activeren', true)];

    activeerForm!: FormGroup;

    enterPressed() {
        if (this.activeerForm && this.activeerForm.valid) {
            this.buttons[0].selected = true;
            setTimeout(() => {
                this.buttons[0].selected = false;
                this.enterClicked();
            }, 300);
        }
    }

    enterClicked() {
        if (this.activeerForm && this.activeerForm.valid) {
            this.activate();
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        console.log('init activeren');
        if (!this.appData.magActiveren()) {
            this.alert.showError('Dubbel activeren niet toegestaan. Geef wachtwoord opnieuw in.');
            this.router.navigate(['login']);
            return;
        }
        sessionStorage.removeItem('notify');
        Promise.all([
            this.bssApi.getAccounts(),
            this.bssApi.getMoyenneKlassenLijst(this.spelId),
            this.bssApi.getVerenigingenKort()
        ])
        .then(results => {
            this.account = results[0][0];
            this.klassen = results[1];
            this.verenigingen = results[2];
            this.createActiveerForm();
        })
        .catch(err => {
            this.alert.showError(err);
            this.router.navigate(['login']);
        })
    }

    private activate() {
        this.account.userId = this.userId?.value;
        this.account.role = 'gebruiker';
        this.account.verId = this.verId?.value;
        this.account.klasse = this.klasse?.value;
        this.account.activatieCode = this.helper.transform(this.account.host);
        this.account.host = '';
        const dlw = this.helper.getDateTimeAsString(new Date());
        console.log(dlw);
        this.account.dlw = dlw;
        this.account.lastLogin = dlw;
        this.bssApi.addAccount(this.account)
        .then(resp => {
            this.router.navigate(['login']);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private createActiveerForm() {
        this.activeerForm = this.fb.nonNullable.group({
            userId: [this.account.userId, [Validators.required, Validators.minLength(3), notEmpty()]],
            verId: [this.account.verId],
            klasse: [this.account.klasse]
        });
    }

    get userId() {
        return this.activeerForm?.get('userId');
    }
    get verId() {
        return this.activeerForm?.get('verId');
    }
    get klasse() {
        return this.activeerForm?.get('klasse');
    }
}
