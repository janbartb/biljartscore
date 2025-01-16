import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { Config } from '../model/config';
import { Button } from '../model/button';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from "../shared/button-group/button/button.component";
import { HelperService } from '../services/helper.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        FormsModule,
        ButtonComponent
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    // pwTxt: string = 'bvd';
    pw: number = 3662;
    pwInput: string = '';

    button: Button = new Button('Enter', 'Login', true);

    htmlInputPw = viewChild<ElementRef<HTMLInputElement>>("pw");

    constructor() {
        super();
        effect(() => {
            this.htmlInputPw()?.nativeElement.focus();
        });
    }

    enterPressed() {
        this.button.selected = true;
        setTimeout(() => {
            this.button.selected = false;
            this.enterClicked();
        }, 300);
    }

    enterClicked() {
        if (this.pwInput == '') {
            return;
        }
        const w = this.helper.transform(this.pwInput);
        if (w === this.pw) {
            this.createStats();
        }
        else {
            this.alert.showAlert('Het wachtwoord is onjuist.', 'warning');
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
}
