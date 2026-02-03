import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { MenuComponent } from '../../shared/menu/menu.component';
import { BaseComponent } from '../../base/base.component';
import { Menu, MenuItem } from '../../model/menu';
import { Wedstrijd } from '../../model/wedstrijd';

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
    wedstrijd: Wedstrijd = new Wedstrijd();

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

    override escapePressed(): void {
        this.router.navigate(['home']);
    }

    menuItemClicked(item: MenuItem) {
        this.menu.selectedIdx = this.menu.getIndex(item);
        console.log('menu item clicked : ' + item.text);
        if (item.shortcut == '3' || item.shortcut == '4') {
            this.menuItem34clicked(Number(item.shortcut));
            return;
        }
        this.router.navigate([item.navigateTo]);
    }

    private menuItem34clicked(shortcut: number) {
        this.bssApi.getWedstrijd()
        .then(resp => {
            if (!resp.gevonden) {
                if (shortcut == 3) {
                    this.router.navigate(['wedstrijd']);
                }
                else {
                    this.wedstrijd.regels.idxOptie = 4;
                    this.wedstrijd.telling.idxOptie = 2;
                    this.bssApi.saveWedstrijd(this.wedstrijd)
                    .then(resp2 => {
                        this.router.navigate(['wedstrijd']);
                    })
                    .catch(err => {
                        this.alert.showError(err);
                    });
                }
            }
            else {
                this.wedstrijd = resp.wedstrijd;
                if (shortcut == 4) {
                    if (this.wedstrijd.regels.idxOptie == 4) {
                        this.router.navigate(['wedstrijd']);
                    }
                    else {
                        this.wedstrijd.regels.idxOptie = 4;
                        this.wedstrijd.regels.vijfdeAantCar = 0;
                        this.wedstrijd.telling.idxOptie = 2;
                        this.wedstrijd.aantSpelers = 0;
                        this.bssApi.saveWedstrijd(this.wedstrijd)
                        .then(resp2 => {
                            this.router.navigate(['wedstrijd']);
                        })
                        .catch(err => {
                            this.alert.showError(err);
                        });
                    }
                }
                else {
                    if (this.wedstrijd.regels.idxOptie == 4) {
                        this.wedstrijd = new Wedstrijd();
                        this.bssApi.saveWedstrijd(this.wedstrijd)
                        .then(resp2 => {
                            this.router.navigate(['wedstrijd']);
                        })
                        .catch(err => {
                            this.alert.showError(err);
                        });
                    }
                    else {
                        this.router.navigate(['wedstrijd']);
                    }
                }
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
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
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        const filler = true;
        this.menu.centered = true;
        this.menu.addItem(new MenuItem('1', 'KNBB competitie team match', 'teammatch'));
        this.menu.addItem(new MenuItem('2', 'KNBB competitie single match', 'match'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('3', 'Oefen wedstrijd', 'wedstrijd'));
        this.menu.addItem(new MenuItem('4', 'Libre met iedere 5e een driebander', 'wedstrijd'));
        this.menu.addItem(new MenuItem('5', 'Pentathlon / Annonceren', 'annon'));
        this.menu.addItem(new MenuItem('', '', '', filler));
        this.menu.addItem(new MenuItem('6', 'Eigen competitie', 'eigencomps'));
    }
}
