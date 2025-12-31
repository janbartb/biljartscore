import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { MenuComponent } from '../shared/menu/menu.component';
import { Menu, MenuItem } from '../model/menu';
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

    menuItemClicked(item: MenuItem) {
        this.menu.selectedIdx = this.menu.getIndex(item);
        console.log('menu item clicked : ' + item.text);
        if (item.navigateTo == 'spelers') {
            localStorage.removeItem('spelersNaamFilter');
            localStorage.removeItem('spelersVerenigingFilter');
        }
        this.appData.gotoPage('onderhoud', 'onderhoud/' + item.navigateTo);
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
            this.buttonPressed('');
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
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
        if (event.code === 'Digit5' || event.code === 'Numpad5') {
            this.buttonPressed('5');
            return false;
        }
        if (event.code === 'Digit6' || event.code === 'Numpad6') {
            this.buttonPressed('6');
            return false;
        }
        if (event.code === 'Digit7' || event.code === 'Numpad7') {
            this.buttonPressed('7');
            return false;
        }
        if (event.code === 'Digit8' || event.code === 'Numpad8') {
            this.buttonPressed('8');
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
        this.menu.addItem(new MenuItem('1', 'Lokaliteiten', 'lokaliteiten'));
        this.menu.addItem(new MenuItem('2', 'Verenigingen / Teams', 'verenigingen'));
        this.menu.addItem(new MenuItem('3', 'Spelers', 'spelers'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('4', 'KNBB districten', 'districten'));
        this.menu.addItem(new MenuItem('5', 'KNBB klassen en moyennes', 'moyennes'));
        this.menu.addItem(new MenuItem('6', 'KNBB competities', 'knbbcompetities'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('7', 'Eigen competities', 'eigencomps'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        if (this.appData.isBeheerder()) {
            this.menu.addItem(new MenuItem('8', 'Accounts', 'accounts'));
        }
        else {
            this.menu.addItem(new MenuItem('8', 'Mijn account', 'account'));
        }
    }
}
