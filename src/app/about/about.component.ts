import { Component, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { BaseComponent } from '../base/base.component';
import { NgClass } from '@angular/common';

class Hoofdstuk {
    tekst: string = '';
    subs: Hoofdstuk[] = [];
    idxSubSelected: number = -1;

    constructor(txt: string) {
        this.tekst = txt;
    }
}

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [
        PageHeaderComponent,
        NgClass
    ],
    templateUrl: './about.component.html',
    styleUrl: './about.component.css'
})
export class AboutComponent extends BaseComponent implements OnInit {
    subtitle: string = '';
    hoofdstukken: Hoofdstuk[] = [];
    hoofdSelected: Hoofdstuk = new Hoofdstuk('');
    sub1Selected: Hoofdstuk = new Hoofdstuk('');
    sub2Selected: Hoofdstuk = new Hoofdstuk('');
    selected: string = '';
    idxSelected: number = -1;

    hoofdstukClicked(idx: number) {
        if (idx == this.idxSelected) {
            return;
        }
        this.idxSelected = idx;
        this.hoofdSelected = this.hoofdstukken[idx];
        this.subtitle = this.hoofdSelected.tekst;
        this.selected = '' + idx;
        if (this.hoofdSelected.subs.length) {
            setTimeout(() => {
                this.sub1HoofdstukClicked(0);
            }, 750);
        }
    }

    sub1HoofdstukClicked(idx: number) {
        if (idx == this.hoofdSelected.idxSubSelected) {
            return;
        }
        this.hoofdSelected.idxSubSelected = idx;
        this.sub1Selected = this.hoofdSelected.subs[idx];
        this.subtitle = this.hoofdSelected.tekst + ' - ' + this.sub1Selected.tekst;
        this.selected = '' + this.idxSelected + idx;
        if (this.sub1Selected.subs.length) {
            setTimeout(() => {
                this.sub2HoofdstukClicked(0);
            }, 750);
        }
    }

    sub2HoofdstukClicked(idx: number) {
        if (idx == this.sub1Selected.idxSubSelected) {
            return;
        }
        this.sub1Selected.idxSubSelected = idx;
        this.sub2Selected = this.sub1Selected.subs[idx];
        this.subtitle = this.hoofdSelected.tekst + ' - ' + this.sub1Selected.tekst + ' - ' + this.sub2Selected.tekst;
        this.selected = '' + this.idxSelected + this.hoofdSelected.idxSubSelected + idx;
    }

    ngOnInit(): void {
        this.hoofdstukken.push(new Hoofdstuk('Algemeen'));
        this.hoofdstukken.push(new Hoofdstuk('Scorebord'));
        this.hoofdstukken.push(new Hoofdstuk('Gegevens'));
        this.hoofdstukken.push(new Hoofdstuk('Biljartpoint'));

        // subhoofdstukken voor scorebord
        this.hoofdstukken[1].subs.push(new Hoofdstuk('Layout'));
        this.hoofdstukken[1].subs.push(new Hoofdstuk('Aantal spelers'));
        // subhoofdstukken voor scorebord - layout
        this.hoofdstukken[1].subs[0].subs.push(new Hoofdstuk('Staand'));
        this.hoofdstukken[1].subs[0].subs.push(new Hoofdstuk('Liggend'));

        this.hoofdstukClicked(0);
    }
}
