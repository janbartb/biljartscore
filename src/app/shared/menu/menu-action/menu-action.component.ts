import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuAction } from '../../../model/menu';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-menu-action',
  standalone: true,
  imports: [NgClass],
  templateUrl: './menu-action.component.html',
  styleUrl: './menu-action.component.css'
})
export class MenuActionComponent {
    @Input() menuAction: MenuAction = new MenuAction('', '', () => {});
    @Input() selected: boolean = false;
    @Output() actionClicked = new EventEmitter<MenuAction>();

    clicked() {
        this.actionClicked.emit(this.menuAction);
    }
}
