import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MenuComponent } from '../../shared/menu/menu.component';
import { BaseComponent } from '../../base/base.component';
import { Menu, MenuItem } from '../../model/menu';

@Component({
    selector: 'app-spelkeuze',
    standalone: true,
    imports: [
        PageHeaderComponent,
        MenuComponent
    ],
    templateUrl: './spelkeuze.component.html',
    styleUrl: './spelkeuze.component.css'
})
export class SpelkeuzeComponent extends BaseComponent implements OnInit {
    menu: Menu = new Menu();

    enterPressed() {
        const item = this.menu.getSelectedItem();
        if (item) {
            this.menuItemClicked(item);
        }
    }

    override escapePressed(): void {
        this.router.navigate(['home']);
    }

    menuItemClicked(item: MenuItem) {
        this.menu.selectedIdx = this.menu.getIndex(item);
        console.log('menu item clicked : ' + item.text);
        this.router.navigate([item.navigateTo]);
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
        this.menu.addItem(new MenuItem('m', 'KNBB competitie team match', 'teammatch'));
        this.menu.addItem(new MenuItem('m', 'KNBB competitie single match', 'match'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('w', 'Oefen wedstrijd', 'wedstrijd/aantspl'));
    }
}
