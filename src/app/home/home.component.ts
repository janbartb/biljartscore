import { Component, HostListener, inject, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { Menu, MenuItem } from '../model/menu';
import { MenuComponent } from '../shared/menu/menu.component';
import { Spelsoort } from '../model/spelsoort';
import { BaseComponent } from '../base/base.component';
import { FormsModule } from '@angular/forms';
import { StatusService } from '../services/status.service';
import { ApiService } from '../services/api.service';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent extends BaseComponent implements OnInit {
    menu: Menu = new Menu();
    elem: any;
    spelsoorten: Spelsoort[] = [];

    constructor(@Inject(DOCUMENT) private document: any) {
        super();
    }

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
            this.router.navigate([item.navigateTo]);
            return;
        }
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
        Promise.all([this.bssApi.getConfig(), this.bssApi.getSpelsoorten()])
        .then(results => {
            this.appData.setConfig(results[0]);
            this.spelsoorten = results[1];
            const gekozenSpel = this.appData.getSpel();
            if (!gekozenSpel) {
                this.spelId = results[0].spelsoort;
                this.spelsoortChanged();
            }
            else {
                this.spelId = gekozenSpel.spelsoortId;
            }
        })
        .catch(err => {
            this.alert.showAlert(err, "error");
        });
        this.appData.resetHistory();
        this.menu.addItem(new MenuItem('w', 'Wedstrijd spelen', 'spelkeuze'));
        this.menu.addItem(new MenuItem('o', 'Onderhoud gegevens', 'onderhoud'));
        this.elem = document.documentElement;
    }

    getSpelsoort(id: string): Spelsoort {
        const found = this.spelsoorten.find(spel => spel.spelsoortId == id);
        return found ? found : new Spelsoort('', '');
    }

    openFullscreen() {
        if (this.elem.requestFullscreen) {
            this.elem.requestFullscreen();
        } else if (this.elem.mozRequestFullScreen) {
            /* Firefox */
            this.elem.mozRequestFullScreen();
        } else if (this.elem.webkitRequestFullscreen) {
            /* Chrome, Safari and Opera */
            this.elem.webkitRequestFullscreen();
        } else if (this.elem.msRequestFullscreen) {
            /* IE/Edge */
            this.elem.msRequestFullscreen();
        }
    }

    closeFullscreen() {
        if (this.document.exitFullscreen) {
            this.document.exitFullscreen();
        } else if (this.document.mozCancelFullScreen) {
            /* Firefox */
            this.document.mozCancelFullScreen();
        } else if (this.document.webkitExitFullscreen) {
            /* Chrome, Safari and Opera */
            this.document.webkitExitFullscreen();
        } else if (this.document.msExitFullscreen) {
            /* IE/Edge */
            this.document.msExitFullscreen();
        }
    }
}
