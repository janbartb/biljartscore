import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { Config } from '../model/config';
import { Button } from '../model/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from "../shared/button-group/button/button.component";
import { HelperService } from '../services/helper.service';
import { notEmpty } from '../directives/validators.directive';
import { DOCUMENT, NgClass } from '@angular/common';
import { Account } from '../model/account';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent extends BaseComponent implements OnInit {
    private document = inject(DOCUMENT);
    helper = inject(HelperService);
    fb = inject(FormBuilder);

    localAccount: Account = new Account();
    remoteAccount: Account = new Account();
    updateLocalAccount: boolean = false;
    updateRemoteAccount: boolean = false;
    version: string = '1.0.0';

    loginForm!: FormGroup;

    button: Button = new Button('Enter', 'Login', true);

    htmlInputId = viewChild<ElementRef<HTMLInputElement>>("loginid");
    htmlInputPw = viewChild<ElementRef<HTMLInputElement>>("loginpw");

    constructor() {
        super();
        effect(() => {
            this.htmlInputPw()?.nativeElement;
            this.htmlInputId()?.nativeElement;
            if (this.loginId?.value > '') {
                this.htmlInputPw()?.nativeElement.focus();
            }
            else {
                this.htmlInputId()?.nativeElement.focus();
            }
        });
    }

    enterPressed() {
        if (!(this.loginForm && this.loginForm.valid)) {
            return;
        }
        this.button.selected = true;
        setTimeout(() => {
            this.button.selected = false;
            this.enterClicked();
        }, 300);
    }

    enterClicked() {
        if (this.loginId?.value != this.localAccount.userId) {
            if (this.appData.isRemote()) {
                this.bssApi.getAccount(this.loginId?.value)
                .then(result => {
                    if (result.role == 'beheerder') {
                        this.localAccount = result;
                        this.remoteAccount = result;
                        this.checkLogin();
                    }
                    else {
                        this.alert.showAlert(`U kunt alleen inloggen met account ID '${this.localAccount.userId}'.`, 'warning', 6);
                        this.loginId?.setValue(this.localAccount.userId);
                        this.loginPw?.setValue('');
                    }
                })
                .catch(err => {
                    this.alert.showAlert(`Account met ID '${this.loginId?.value}' niet gevonden.`, 'warning', 5);
                });
            }
            else {
                this.alert.showAlert(`U kunt alleen inloggen met account ID '${this.localAccount.userId}'.`, 'warning', 6);
                this.loginId?.setValue(this.localAccount.userId);
                this.loginPw?.setValue('');
            }
        }
        else {
            this.checkLogin();
        }
    }

    private checkLogin() {
        if (this.localAccount.password == '') {
            this.alert.showAlert(`Wachtwoord account '${this.localAccount.userId}' is reset! Neem contact op met beheerder.`, 'error', 8);
            return;
        }
        const pwToCheck = this.helper.transform(this.loginPw?.value);
        console.log(pwToCheck);
        if (this.localAccount.password != pwToCheck) {
            this.alert.showAlert('Wachtwoord is niet juist.', 'warning', 5);
            return;
        }
        // login geldig
        localStorage.setItem('bssLoginId', this.localAccount.userId);
        sessionStorage.setItem('accountId', this.localAccount.userId);
        sessionStorage.setItem('accountRole', this.localAccount.role);
        this.localAccount.lastLogin = this.helper.getDateTimeAsString(new Date());
        this.bssApi.updateAccount(this.localAccount)
        .then()
        .catch(err => {
            this.alert.showError(err);
        });
        this.openFullscreen();
        this.router.navigate(['home']);
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
        this.bssApi.getAccounts(true) // get local account
        .then(result => {
            this.localAccount = result[0];
            this.bssApi.getRemoteMode()
            .then(resp => {
                this.appData.setRemote(true);
                this.bssApi.getAccount(this.localAccount.userId) // get remote account
                .then(result => {
                    this.remoteAccount = result;
                    if (this.remoteAccount.password == '' && this.localAccount.password != '') {
                        this.localAccount.password = '';
                        this.updateLocalAccount = true;
                    }
                    this.compareAndAjustAccounts();
                    let promises: Promise<any>[] = [];
                    if (this.updateLocalAccount) {
                        promises.push(this.bssApi.updateAccount(this.localAccount, true))
                    }
                    if (this.updateRemoteAccount) {
                        promises.push(this.bssApi.updateAccount(this.remoteAccount))
                    }
                    if (promises.length) {
                        Promise.all(promises)
                        .then(resps => {
                            this.initLogin();
                        })
                        .catch(err => {
                            this.alert.showError(err);
                        });
                    }
                    else {
                        this.initLogin();
                    }
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            })
            .catch(err => {
                this.appData.setRemote(false);
                this.initLogin();
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private initLogin() {
        this.createLoginForm(this.localAccount.userId);
        this.htmlInputId()?.nativeElement.focus();
        this.closeFullscreen();
    }

    private compareAndAjustAccounts(): void {
        let result = false;
        if (this.remoteAccount.password != this.localAccount.password) {
            if (this.remoteAccount.dlw > this.localAccount.dlw) {
                this.localAccount.password = this.remoteAccount.password;
                this.updateRemoteAccount = true;
            }
            else {
                this.remoteAccount.password = this.localAccount.password;
                this.updateLocalAccount = true;
            }
        }
        if (this.remoteAccount.verId != this.localAccount.verId) {
            if (this.remoteAccount.dlw > this.localAccount.dlw) {
                this.localAccount.verId = this.remoteAccount.verId;
                this.updateRemoteAccount = true;
            }
            else {
                this.remoteAccount.verId = this.localAccount.verId;
                this.updateLocalAccount = true;
            }
        }
        if (this.remoteAccount.klasse != this.localAccount.klasse) {
            if (this.remoteAccount.dlw > this.localAccount.dlw) {
                this.localAccount.klasse = this.remoteAccount.klasse;
                this.updateRemoteAccount = true;
            }
            else {
                this.remoteAccount.klasse = this.localAccount.klasse;
                this.updateLocalAccount = true;
            }
        }
    }

    private createLoginForm(defaultId?: string) {
        if (!defaultId) {
            defaultId = '';
        }
        this.loginForm = this.fb.nonNullable.group({
            loginId: [defaultId, [Validators.required, Validators.minLength(3), notEmpty()]],
            loginPw: ['', [Validators.required, Validators.minLength(3), notEmpty()]]
        });
    }

    private createStats() {
        this.bssApi.createStats()
        .then(resp => {
            //console.log(resp.data);
            let config: Config | undefined = this.appData.getConfig();
            if (!config) {
                return;
            }
            config.id = resp.data.birthtimeMs;
            this.appData.setConfig(config);
            this.bssApi.saveConfig(config)
            .then(resp2 => {
                localStorage.removeItem('notifications');
                this.router.navigate(['home']);
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    openFullscreen() {
        if (!this.document.fullscreenElement) {
            this.document.documentElement.requestFullscreen();
        }
    }

    closeFullscreen() {
        if (this.document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    get loginId() {
        return this.loginForm?.get('loginId');
    }
    get loginPw() {
        return this.loginForm?.get('loginPw');
    }
}
