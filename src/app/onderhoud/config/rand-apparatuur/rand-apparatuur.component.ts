import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../base/base.component';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { RandActieComponent } from './rand-actie/rand-actie.component';
import { NgClass } from '@angular/common';
import { Apparaat, AppSpelActie, Config } from '../../../model/config';
import { Button } from '../../../model/button';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-rand-apparatuur',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass,
        RandActieComponent
    ],
    templateUrl: './rand-apparatuur.component.html',
    styleUrl: './rand-apparatuur.component.css'
})
export class RandApparatuurComponent extends BaseComponent implements OnInit {
    subtitle: string = '';
    apparaten: Apparaat[] = [];
    apparaatNaam: string = '';
    idxApparaat: number = -1;
    idxSpel: number = -1;
    idxActie: number = -1;
    acties: AppSpelActie[] = [];
    origActies: string = '';
    apparaatContainerHeight: string = '';
    toetsenGewijzigd: boolean = false;

    buttons: Button[] = [
        new Button('Enter', 'Opslaan', true)
    ];

    buttonPressed(button: Button) {
        if (!this.toetsenGewijzigd) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            this.enterClicked();
        }, 300);
    }

    enterClicked() {
        let config: Config | undefined = this.appData.getConfig();
        if (!config) {
            this.alert.showError('Fout opgetreden bij opslaan. Config niet gevonden in local storage.');
            return;
        }
        this.apparaten[this.idxApparaat].spelen[this.idxSpel].acties = this.acties;
        config.apparaten = this.apparaten;
        this.bssApi.saveConfig(config)
        .then(resp => {
            this.appData.setConfig(config);
            this.alert.showAlert('Acties succesvol opgeslagen.', 'success', 3);
            this.origActies = JSON.stringify(this.acties);
            this.toetsenGewijzigd = false;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    selecteerApparaat(idx: number, event: MouseEvent) {
        console.log(event.getModifierState('NumLock'));
        this.subtitle = '';
        if (idx == this.idxApparaat) {
            return;
        }
        if (idx == 0 && event.getModifierState('NumLock')) {
            this.alert.showAlert('Numlock staat aan! Zet deze eerst uit.', 'warning', 5);
            return;
        }
        if (this.toetsenGewijzigd) {
            this.alert.showAlert('De gewijzigde toetsen zijn NIET opgeslagen.', 'warning', 5);
        }
        this.toetsenGewijzigd = false;
        this.idxApparaat = idx;
        this.apparaatNaam = this.apparaten[idx].naam.toLowerCase();
        this.idxSpel = -1;
        this.acties = [];
        this.subtitle = ' - ' + this.apparaten[idx].naam;
        if (this.apparaten[idx].spelen.length == 1) {
            this.selecteerSpel(0);
        }
        else {
            this.selecteerSpel(-1);
        }
    }

    selecteerSpel(idx: number) {
        if (idx == this.idxSpel) {
            return;
        }
        if (this.toetsenGewijzigd) {
            this.alert.showAlert('De gewijzigde toetsen zijn NIET opgeslagen.', 'warning', 5);
        }
        this.toetsenGewijzigd = false;
        this.idxSpel = idx;
        this.getActies();
    }

    selecteerActie(idx: number, event: MouseEvent) {
        if (this.idxApparaat == 0 && event.getModifierState('NumLock')) {
            this.alert.showAlert('Numlock staat aan! Zet deze eerst uit.', 'warning', 5);
            return;
        }
        if (idx < 0 || idx >= this.acties.length) {
            return;
        }
        if (!this.acties[idx].editable) {
            return;
        }
        if (idx == this.idxActie) {
            this.idxActie = -1;
            return;
        }
        this.idxActie = idx;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(this.buttons[0]);
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
        if (this.idxActie >= 0) {
            this.acties[this.idxActie].code = event.code;
            this.acties[this.idxActie].key = event.key;
            setTimeout(() => {
                this.idxActie = -1;
                this.toetsenGewijzigd = this.zijnErToetsenGewijzigd() && !this.duplicateToetsen();
            }, 1000);
            
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.apparaten = this.appData.getConfig()?.apparaten || [];
        if (!this.apparaten.length) {
            this.alert.showError('Geen apparaten gevonden in config bestand.');
            return;
        }
        let h = 25.5 / this.apparaten.length;
        h = Math.floor(10 * h) / 10;
        this.apparaatContainerHeight = h + 'em';
    }

    private getActies() {
        let a = this.apparaten[this.idxApparaat].spelen[this.idxSpel]?.acties || [];
        this.origActies = JSON.stringify(a);
        this.acties = JSON.parse(this.origActies);
        this.idxActie = -1;
    }

    private zijnErToetsenGewijzigd(): boolean {
        return JSON.stringify(this.acties) != this.origActies;
    }

    private duplicateToetsen(): boolean {
        const codes = this.acties.map(act => act.code);
        const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
        return duplicates.length > 0;
    }
    
}
