import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../base/base.component';
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

    geactiveerd: boolean = false;
    version: string = '1.0.0';

    loginForm!: FormGroup;

    homeButton: Button = new Button('Enter', 'Naar hoofdmenu', true);
    actButton: Button = new Button('Enter', 'Activeer', true);

    htmlInputPw = viewChild<ElementRef<HTMLInputElement>>("loginpw");

    constructor() {
        super();
        effect(() => {
            this.htmlInputPw()?.nativeElement;
            this.htmlInputPw()?.nativeElement.focus();
        });
    }

    enterPressed(button: Button) {
        if (this.geactiveerd || (this.loginForm && this.loginForm.valid)) {
            button.selected = true;
            setTimeout(() => {
                button.selected = false;
                this.enterClicked();
            }, 300);
        }
    }

    enterClicked() {
        if (this.geactiveerd) {
            this.openFullscreen();
            this.router.navigate(['home']);
            return;
        }
        if (!(this.loginForm && this.loginForm.valid)) {
            return;
        }
        if (this.helper.transform(this.loginPw?.value) == '1275450') {
            sessionStorage.setItem('notify', 'true');
            this.openFullscreen();
            this.router.navigate(['activeer']);
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        //console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (this.geactiveerd) {
                this.enterPressed(this.homeButton);
            }
            else {
                this.enterPressed(this.actButton);
            }
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.geactiveerd = this.appData.isGeactiveerd();
        if (!this.geactiveerd) {
            console.log('nog niet actief');
            this.bssApi.getAccounts() // get local account
            .then(results => {
                if (results.length == 1) {
                    const account: Account = results[0];
                    console.log(account.activatieCode);
                    if (account.activatieCode && account.activatieCode != '') {
                        this.geactiveerd = (account.host == '' || account.activatieCode == this.helper.transform(account.host));
                        if (this.geactiveerd) {
                            account.host = '';
                            sessionStorage.setItem('account', JSON.stringify(account));
                        }
                    }
                }
                if (this.geactiveerd) {
                    this.appData.activeer();
                }
                else {
                    this.appData.deactiveer();
                    this.initActivatie();
                }
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
    }

    private initActivatie() {
        this.createLoginForm();
        this.htmlInputPw()?.nativeElement.focus();
        this.closeFullscreen();
    }

    private createLoginForm() {
        this.loginForm = this.fb.nonNullable.group({
            loginPw: ['', [Validators.required, Validators.minLength(3), notEmpty()]]
        });
    }

    // private createStats() {
    //     this.bssApi.createStats()
    //     .then(resp => {
    //         //console.log(resp.data);
    //         let config: Config | undefined = this.appData.getConfig();
    //         if (!config) {
    //             return;
    //         }
    //         config.id = resp.data.birthtimeMs;
    //         this.appData.setConfig(config);
    //         this.bssApi.saveConfig(config)
    //         .then(resp2 => {
    //             localStorage.removeItem('notifications');
    //             this.router.navigate(['home']);
    //         })
    //         .catch(err => {
    //             this.alert.showError(err);
    //         });
    //     })
    //     .catch(err => {
    //         this.alert.showError(err);
    //     });
    // }

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

    get loginPw() {
        return this.loginForm?.get('loginPw');
    }
}
