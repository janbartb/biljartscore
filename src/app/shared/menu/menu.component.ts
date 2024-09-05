import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Menu, MenuItem } from '../../model/menu';
import { MenuItemComponent } from './menu-item/menu-item.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MenuItemComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
    @Input() menu: Menu = new Menu();
    @Output() menuItemClicked = new EventEmitter<MenuItem>();

    itemClicked(item: MenuItem) {
        this.menuItemClicked.emit(item);
    }
}
