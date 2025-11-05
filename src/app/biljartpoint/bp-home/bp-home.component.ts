import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MenuComponent } from '../../shared/menu/menu.component';
import { BaseComponent } from '../../base/base.component';
import { Menu, MenuItem } from '../../model/menu';
import { HelpComponent } from '../../shared/help/help.component';

@Component({
    selector: 'app-bp-home',
    standalone: true,
    imports: [
        PageHeaderComponent,
        MenuComponent,
        HelpComponent
    ],
    templateUrl: './bp-home.component.html',
    styleUrl: './bp-home.component.css'
})
export class BpHomeComponent extends BaseComponent implements OnInit {
    title: string = 'Biljartpoint';
    subtitle: string = 'Menu';
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
        if (item.shortcut == '3' && this.appData.getDistrict().disId == '') {
            this.alert.showAlert(`Maak eerst via de optie 'Districten' het standaard district aan.`, 'info', 8);
            return;
        }
        this.appData.gotoPage(this.router.url, item.navigateTo);
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
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        const filler = true;
        this.menu.centered = true;
        this.menu.addItem(new MenuItem('1', 'Districten', 'bpoint/districten'));
        this.menu.addItem(new MenuItem('2', 'Moyenne tabellen (driebanden klein B1-B2)', 'bpoint/moyennes'));
        this.menu.addItem(new MenuItem('3', 'Competities', 'bpoint/competities'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('4', 'Oude seizoen verwijderen', 'bpoint/opschonen'));
    }

}
