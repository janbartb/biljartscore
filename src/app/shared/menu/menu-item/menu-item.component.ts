import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from '../../../model/menu';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [NgClass],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.css'
})
export class MenuItemComponent {
    @Input() menuItem: MenuItem = new MenuItem('', '', '');
    @Input() selected: boolean = false;
    @Output() itemClicked = new EventEmitter<MenuItem>();

    clicked() {
        this.itemClicked.emit(this.menuItem);
    }
}
