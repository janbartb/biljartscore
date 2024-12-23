import { Component, HostListener, inject, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Menu, MenuItem } from '../model/menu';
import { MenuComponent } from '../shared/menu/menu.component';
import { Spelsoort } from '../model/spelsoort';
import { BaseComponent } from '../base/base.component';
import { FormsModule } from '@angular/forms';
import { Config } from '../model/config';

//declare var mySpeechObject: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent extends BaseComponent implements OnInit {
    private document = inject(DOCUMENT);

    version: string = '1.0.0';
    menu: Menu = new Menu();
    spelsoorten: Spelsoort[] = [];
    screenReady: boolean = false;
    notAllowed: boolean = false;

    enterClicked() {
        const item = this.menu.getSelectedItem();
        if (item) {
            this.menuItemClicked(item);
        }
    }

    escapeClicked() {
        this.menu.cancelSelection();
        this.closeFullscreen();
    }

    spelsoortChanged() {
        this.appData.setSpel(this.getSpelsoort(this.spelId));
    }

    menuItemClicked(item: MenuItem) {
        this.menu.selectedIdx = this.menu.getIndex(item);
        console.log('menu item clicked : ' + item.text);
        if (item.shortcut == 'w') {
            this.openFullscreen();
            this.router.navigate([item.navigateTo]);
            return;
        }
        this.openFullscreen();
        this.appData.gotoPage('home', item.navigateTo);
    }

    keyupSpelsoort(event: KeyboardEvent) {
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown' || event.key === 'Enter') {
            event.stopPropagation();
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
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
            this.enterClicked();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapeClicked();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.bssApi.statsExists()
        .then(exists => {
            if (!exists) {
                this.router.navigate(['login']);
                return;
            }
            this.screenReady = true;
            this.bssApi.getStats()
            .then(stats => {
                let config: Config | undefined = this.appData.getConfig();
                if (!config) {
                    this.alert.showError('Configuratie niet gevonden in App data.');
                    return;
                }
                if (config.id != stats.birthtimeMs) {
                    this.notAllowed = true;
                    localStorage.setItem('notifications', '0');
                    return;
                }
                localStorage.removeItem('notifications');
                this.bssApi.getSpelsoorten()
                .then(data => {
                    this.spelsoorten = data;
                    const gekozenSpel = this.appData.getSpel();
                    if (!gekozenSpel) {
                        console.log('Voorkeur spelsoort niet gevonden. Gezet op driebanden.');
                        this.spelId = '3BA';
                        this.spelsoortChanged();
                    }
                    else {
                        this.spelId = gekozenSpel.spelsoortId;
                    }
                })
                .catch(err => {
                    this.alert.showError(err);
                });
            })
            .catch(err => {
                this.alert.showError(err);
            });
        })
        .catch(err => {
            this.alert.showError(err);
        });
        
        this.appData.resetHistory();
        this.menu.addItem(new MenuItem('w', 'Wedstrijd spelen', 'spelkeuze'));
        this.menu.addItem(new MenuItem('o', 'Onderhoud gegevens', 'onderhoud'));
        this.closeFullscreen();
    }

    getSpelsoort(id: string): Spelsoort {
        const found = this.spelsoorten.find(spel => spel.spelsoortId == id);
        return found ? found : new Spelsoort('', '');
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
}
