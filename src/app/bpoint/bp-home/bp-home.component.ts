import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MenuComponent } from '../../shared/menu/menu.component';
import { BaseComponent } from '../../base/base.component';
import { Menu, MenuItem } from '../../model/menu';

@Component({
    selector: 'app-bp-home',
    standalone: true,
    imports: [
        PageHeaderComponent,
        MenuComponent
    ],
    templateUrl: './bp-home.component.html',
    styleUrl: './bp-home.component.css'
})
export class BpHomeComponent extends BaseComponent implements OnInit {
    title: string = 'Biljartpoint';
    subtitle: string = 'Menu';
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
        if (item.shortcut == 'c' && this.appData.getDistrict().disId == '') {
            this.alert.showAlert(`Maak eerst via de optie 'Districten' het standaard district aan.`, 'info', 8);
            return;
        }
        this.appData.gotoPage('bpoint/home', item.navigateTo);
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
        const filler = true;
        this.menu.centered = true;
        this.menu.addItem(new MenuItem('v', 'Districten', 'bpoint/districten'));
        this.menu.addItem(new MenuItem('m', 'Moyenne tabellen (driebanden klein B1-B2)', 'bpoint/moyennes'));
        this.menu.addItem(new MenuItem('c', 'Competities', 'bpoint/competities'));
    }

}
