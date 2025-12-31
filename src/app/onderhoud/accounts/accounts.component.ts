import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { HelperService } from '../../services/helper.service';
import { Account } from '../../model/account';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { List } from '../../model/list';
import { NgClass } from '@angular/common';
import { Alinea, ConfirmDialog } from '../../model/dialogs';
import { Button } from '../../model/button';
import { VerenigingKort } from '../../model/vereniging';
import { Scrolling } from '../../model/scrolling';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';

interface AccountItem {
    account: Account;
    verNaam: string;
}

@Component({
    selector: 'app-accounts',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ConfirmComponent,
        NgClass
    ],
    templateUrl: './accounts.component.html',
    styleUrl: './accounts.component.css'
})
export class AccountsComponent extends BaseComponent implements OnInit {
    accountLijst: List<AccountItem> = new List<AccountItem>();
    verenigingen: VerenigingKort[] = [];
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);
    idxToDelete: number = -1;

    scrollElm!: HTMLDivElement;
    accountScroll!: Scrolling;

    buttons: Button[] = [
        new Button('+', 'Account', true),
        new Button('Enter', 'Selecteer', true)
    ];

    htmlAccountLijst = viewChild<ElementRef<HTMLDivElement>>('accountlijst');

    constructor() {
        super();
        effect(() => {
            this.htmlAccountLijst()?.nativeElement;
        });
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
            this.accountToevoegenClicked();
        }
        else if (idx == 1) {
            this.accountClicked(this.accountLijst.hoveredIdx);
        }
    }

    accountClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.accountLijst.selectItem(idx);
        this.appData.gotoPage(this.router.url, this.router.url + '/' + this.accountLijst.getItem(idx)?.account.userId)
    }

    accountToevoegenClicked() {
        this.appData.gotoPage(this.router.url, this.router.url + '/toevoegen')
    }

    accountVerwijderenClicked(event: any, idx: number) {
        event?.stopPropagation();
        if (this.accountLijst.isIndexWithinRange(idx)) {
            //TODO: first confirm and save if confirmed
            const itemToRemove = this.accountLijst.filtered[idx];
            if (itemToRemove.account.role == 'beheerder') {
                this.alert.showAlert(`De beheerder kan niet worden verwijderd`, 'warning', 5);
                return;
            }
            this.idxToDelete = idx;
            this.confirmVerwijderen(itemToRemove.account);
        }
    }

    private confirmVerwijderen(account: Account) {
        let inhoud: Alinea[] = [];
        let lines = [`Gebruiker '${account.userId}' verwijderen.`];
        inhoud.push(new Alinea(lines));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        if (confirmed) {
            const accountToRemove = this.accountLijst.filtered[this.idxToDelete];
            this.accountLijst.items = this.accountLijst.items.filter(item => item.account.userId != accountToRemove.account.userId);
            this.accountLijst.filtered.splice(this.idxToDelete, 1);
            this.accountLijst.clearSelection();
            this.bssApi.deleteAccount(accountToRemove.account)
            .then(resp => {
                this.alert.showAlert(`Account '${accountToRemove.account.userId}' is verwijderd.`, 'success');
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        this.isDialogOpen = false;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent): boolean {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
        }
        return true;
    }    
    
    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return true;
        }
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.accountLijst.hoverPreviousItem();
                this.accountScroll.scrollUp(this.accountLijst.hoveredIdx);
            }
            if (event.key === 'ArrowDown') {
                this.accountLijst.hoverNextItem();
                this.accountScroll.scrollDown(this.accountLijst.hoveredIdx);
            }
            this.setEscapeCount();
            return false;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(1);
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'Equal' || event.code === 'NumpadAdd') {
            this.buttonPressed(0);
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
            this.bssApi.getVerenigingenKort()
        ])
        .then(results => {
            let accounts: AccountItem[] = [];
            results[0].sort(this.compareAccounts);
            results[0].forEach(acc => {
                let verNm = '';
                if (acc.verId != '') {
                    const ver = results[1].find(v => v.verId == acc.verId);
                    if (ver) {
                        verNm = ver.naam;
                    }
                }
                accounts.push({'account': acc, 'verNaam': verNm});
            });
            this.accountLijst.fillItems(accounts);

            const elm = this.htmlAccountLijst()?.nativeElement;
            if (elm) {
                this.scrollElm = elm;
                new ResizeObserver(() => { 
                    this.initAccountLijstScrolling(this.scrollElm);
                }).observe(this.scrollElm);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private initAccountLijstScrolling(elm: HTMLDivElement) {
        if (elm) {
            this.accountScroll = new Scrolling(elm, elm.offsetHeight, this.accountLijst.filtered.length);
            console.log('resize event - pos = ' + this.accountScroll.scrollPos);    
        }
    }

    private setEscapeCount() {
        this.escapeCount = this.accountLijst.hoveredIdx < 0 ? 0 : 1;
    }

    private compareAccounts(a: Account, b: Account): number {
        if (a.lastLogin == b.lastLogin) {
            return a.userId > b.userId ? 1 : -1;
        }
        return (a.lastLogin > b.lastLogin) ? -1 : 1;
    }

    private compareVerenigingen(a: VerenigingKort, b: VerenigingKort): number {
        return (a.naam > b.naam) ? 1 : -1;
    }

}
