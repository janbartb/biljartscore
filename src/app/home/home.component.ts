import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Menu, MenuItem } from '../model/menu';
import { MenuComponent } from '../shared/menu/menu.component';
import { Spelsoort } from '../model/spelsoort';
import { BaseComponent } from '../base/base.component';
import { HelperService } from '../services/helper.service';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { Alinea, ConfirmDialog } from '../model/dialogs';
import { ConfirmComponent } from '../shared/confirm/confirm.component';

//declare var mySpeechObject: any;

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        PageHeaderComponent,
        MenuComponent,
        ConfirmComponent
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    version: string = '1.0.0';
    menu: Menu = new Menu();
    spelsoorten: Spelsoort[] = [];
    screenReady: boolean = false;
    notAllowed: boolean = false;

    logoffDialog: ConfirmDialog = new ConfirmDialog('', []);

    override escapePressed(): void {
        this.escapeClicked();
    }

    buttonPressed(shortcut: string) {
        let item = this.menu.getSelectedItem();
        if (shortcut != '') {
            item = this.menu.getItem(shortcut);
        }
        if (item) {
            const idx = this.menu.getIndex(item);
            this.menu.selectedIdx = idx;
            setTimeout(() => {
                this.menuItemClicked(item);                
            }, 300);
         }    
    }

    escapeClicked() {
        if (this.menu.selectedIdx >= 0) {
            this.menu.cancelSelection();
            return;
        }
        this.confirmLogoff();
    }

    spelsoortChanged() {
        this.appData.setSpel(this.getSpelsoort(this.spelId));
    }

    menuItemClicked(item: MenuItem) {
        this.menu.selectedIdx = this.menu.getIndex(item);
        if (item.shortcut == '0') {
            this.confirmLogoff();
            return;
        }
        if (item.shortcut == '1') {
            this.router.navigate([item.navigateTo]);
            return;
        }
        this.appData.gotoPage(this.router.url, item.navigateTo);
    }

    confirmLogoff() {
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`U gaat uitloggen.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.logoffDialog = new ConfirmDialog('logoff', inhoud);
        this.isDialogOpen = true;
    }

    confirmLogoffReplied(confirmed: boolean) {
        if (confirmed) {
            this.appData.clearSession();
            this.router.navigate(['login']);
            return;
        }
        this.isDialogOpen = false;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return true;
        }
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.menu.selectPreviousItem();
                return false;
            }
            if (event.key === 'ArrowDown') {
                this.menu.selectNextItem();
                return false;
            }
            return true;
        }
        if (event.key === 'Enter') {
            this.buttonPressed('');
            return false;
        }
        if (event.key === 'Escape') {
            this.escapeClicked();
            return false;
        }
        if (event.code === 'Digit1' || event.code === 'Numpad1') {
            this.buttonPressed('1');
            return false;
        }
        if (event.code === 'Digit2' || event.code === 'Numpad2') {
            this.buttonPressed('2');
            return false;
        }
        if (event.code === 'Digit3' || event.code === 'Numpad3') {
            this.buttonPressed('3');
            return false;
        }
        if (event.code === 'Digit4' || event.code === 'Numpad4') {
            this.buttonPressed('4');
            return false;
        }
        if (event.code === 'Digit0' || event.code === 'Numpad0') {
            this.buttonPressed('0');
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        if (this.appData.isNotLoggedIn()) {
            this.router.navigate(['login']);
            return;
        }
        this.appData.resetHistory();
        const filler = true;
        this.menu.addItem(new MenuItem('1', 'Wedstrijd spelen', 'spelkeuze'));
        this.menu.addItem(new MenuItem('2', 'Onderhoud gegevens', 'onderhoud'));
        this.menu.addItem(new MenuItem('3', 'Biljartpoint (Kempenland)', 'bpoint/home'));    
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('4', 'Instellingen', 'config'));    
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('0', 'Uitloggen', 'login'));    
    }

    // ngOnInitOld(): void {
    //     console.log(this.helper.transform('verlopen'));
    //     this.bssApi.statsExists()
    //     .then(exists => {
    //         if (!exists) {
    //             this.router.navigate(['login']);
    //             return;
    //         }
    //         this.screenReady = true;
    //         this.bssApi.getStats()
    //         .then(stats => {
    //             let config: Config | undefined = this.appData.getConfig();
    //             if (!config) {
    //                 this.router.navigate(['error/config']);
    //                 //this.alert.showError('Configuratie niet gevonden in App data.');
    //                 return;
    //             }
    //             if (config.id != stats.birthtimeMs) {
    //                 this.notAllowed = true;
    //                 localStorage.setItem('notifications', '0');
    //                 this.router.navigate(['error/illegal']);
    //                 return;
    //             }
    //             localStorage.removeItem('notifications');
    //             this.version = config.version;
    //             this.bssApi.getSpelsoorten()
    //             .then(data => {
    //                 this.spelsoorten = data;
    //                 const gekozenSpel = this.appData.getSpel();
    //                 if (!gekozenSpel) {
    //                     console.log('Voorkeur spelsoort niet gevonden. Gezet op driebanden.');
    //                     this.spelId = '3BA';
    //                     this.spelsoortChanged();
    //                 }
    //                 else {
    //                     this.spelId = gekozenSpel.spelsoortId;
    //                 }
    //             })
    //             .catch(err => {
    //                 this.alert.showError(err);
    //             });
    //         })
    //         .catch(err => {
    //             this.alert.showError(err);
    //         });
    //     })
    //     .catch(err => {
    //         this.alert.showError(err);
    //     });
        
    //     this.appData.resetHistory();
    //     const filler = true;
    //     this.menu.addItem(new MenuItem('1', 'Wedstrijd spelen', 'spelkeuze'));
    //     this.menu.addItem(new MenuItem('2', 'Onderhoud gegevens', 'onderhoud'));
    //     if (this.spelId == '3BA') {
    //         this.menu.addItem(new MenuItem('', '', '', filler));
    //         this.menu.addItem(new MenuItem('3', 'Biljartpoint (Kempenland)', 'bpoint/home'));    
    //     }
    //     this.menu.addItem(new MenuItem('', '', '', filler));
    //     this.menu.addItem(new MenuItem('4', 'Instellingen', 'config'));    
    //     this.closeFullscreen();
    // }

    getSpelsoort(id: string): Spelsoort {
        const found = this.spelsoorten.find(spel => spel.spelsoortId == id);
        return found ? found : new Spelsoort('', '');
    }

}
