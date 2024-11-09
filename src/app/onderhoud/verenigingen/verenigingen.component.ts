import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { BaseComponent } from '../../base/base.component';
import { List } from '../../model/list';
import { VerenigingWrapper } from '../../model/vereniging';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { Button } from '../../model/button';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { HelperService } from '../../services/helper.service';

@Component({
    selector: 'app-verenigingen',
    standalone: true,
    imports: [
        PageHeaderComponent, 
        SectionFooterBtnsComponent,
        ButtonComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './verenigingen.component.html',
    styleUrl: './verenigingen.component.css'
})
export class VerenigingenComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    title: string = 'Onderhoud gegevens';
    subtitle: string = 'Verenigingen';
    thisUrl = 'onderhoud/verenigingen';
    verenigingLijst: List<VerenigingWrapper> = new List<VerenigingWrapper>();
    naamFilter: string = '';

    buttons: Button[] = [new Button('+', 'Vereniging toevoegen', true)];

    htmlVerLijst = viewChild<ElementRef<HTMLDivElement>>('verlijst');

    constructor() {
        super();
        effect(() => {
            this.htmlVerLijst()?.nativeElement;
        });
    }

    enterPressed() {
        if (this.verenigingLijst.hoveredIdx >= 0) {
            this.verenigingClicked(this.verenigingLijst.hoveredIdx);
        }
    }

    buttonPressed(key: string) {
        if (key == '+') {
            this.buttons[0].selected = true;
            setTimeout(() => {
                this.buttons[0].selected = false;
                this.verenigingToevoegenClicked();
            }, 500);
        }
    }

    verenigingClicked(idx: number) {
        this.verenigingLijst.selectItem(idx);
        this.appData.gotoPage(this.thisUrl, this.thisUrl + '/' + this.verenigingLijst.getItem(idx)?.vereniging.verId)
    }

    verenigingToevoegenClicked() {
        this.appData.gotoPage(this.thisUrl, this.thisUrl + '/toevoegen')
    }

    naamFilterChanged(event: KeyboardEvent) {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape') {
            return;
        }
        this.filtersChanged();
        this.sortVerenigingen();
    }

    filtersChanged() {
        if (!this.naamFilter.length) {
            this.verenigingLijst.filter((item: VerenigingWrapper) => { return true; });
            return;
        }
        this.verenigingLijst.filter((item: VerenigingWrapper) => {
            return item.vereniging.naam.toLowerCase().indexOf(this.naamFilter.toLowerCase()) >= 0;
        });
    }

    sortVerenigingen() {
        this.verenigingLijst.filtered.sort((a, b) => {
            if (a.vereniging.naam == b.vereniging.naam) {
                return 0;
            }
            return (a.vereniging.naam > b.vereniging.naam) ? 1 : -1;
        });
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key ==='ArrowUp' || event.key ==='ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.verenigingLijst.hoverPreviousItem();
                if (this.verenigingLijst.hoveredIdx == 13) {
                    this.helper.scrollUp(this.htmlVerLijst());
                }
                if (this.verenigingLijst.hoveredIdx == this.verenigingLijst.filtered.length - 1) {
                    this.helper.scrollDown(this.htmlVerLijst());
                }
            }
            if (event.key === 'ArrowDown') {
                this.verenigingLijst.hoverNextItem();
                if (this.verenigingLijst.hoveredIdx == 14) {
                    this.helper.scrollDown(this.htmlVerLijst());
                }
                if (this.verenigingLijst.hoveredIdx == 0) {
                    this.helper.scrollUp(this.htmlVerLijst());
                }
            }
            return false;
        }
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.key === '+' || event.key === '=') {
            this.buttonPressed('+');
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }    
        return true;
    }

    ngOnInit(): void {
        this.bssApi.getVerenigingenLijst()
            .then(result => {
                this.verenigingLijst.fillItems(result);
                this.sortVerenigingen();
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
    }
}
