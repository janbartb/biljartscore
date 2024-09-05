import { Component, HostListener, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { MenuComponent } from '../shared/menu/menu.component';
import { Menu, MenuItem } from '../model/menu';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { BaseComponent } from '../base/base.component';

@Component({
    selector: 'app-onderhoud',
    standalone: true,
    imports: [
        PageHeaderComponent,
        MenuComponent
    ],
    templateUrl: './onderhoud.component.html',
    styleUrl: './onderhoud.component.css'
})
export class OnderhoudComponent extends BaseComponent implements OnInit {
    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Hoofdmenu';
    menu: Menu = new Menu();

    enterPressed() {
        const item = this.menu.getSelectedItem();
        if (item) {
            this.menuItemClicked(item);
        }
    }

    menuItemClicked(item: MenuItem) {
        this.menu.selectedIdx = this.menu.getIndex(item);
        console.log('menu item clicked : ' + item.text);
        this.router.navigate(['onderhoud', item.navigateTo]);
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
            this.enterPressed();
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
        this.previousUrl = 'home';
        const filler = true;
        this.menu.centered = true;
        this.menu.addItem(new MenuItem('v', 'Verenigingen', 'verenigingen'));
        this.menu.addItem(new MenuItem('s', 'Spelers', 'spelers'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('k', 'KNBB competities', 'knbbcomps'));
        this.menu.addItem(new MenuItem('e', 'Eigen competities', 'eigencomps'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('m', 'KNBB klassen en moyennetabellen', 'klassen'));
        this.menu.addItem(new MenuItem('p', 'Spelsoorten', 'spelsoorten'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('i', 'Instellingen', 'instellingen'));
    }
}
