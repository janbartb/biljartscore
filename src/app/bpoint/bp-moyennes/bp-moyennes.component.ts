import { Component, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { FormsModule } from '@angular/forms';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { Button } from '../../model/button';
import { BpMoyTabel } from '../../model/bpoint';
import { MoyenneTabel, MoyenneTabelEntry } from '../../model/moyenne-tabel';
import { HelperService } from '../../services/helper.service';

class Option {
    val: string = '';
    txt: string = '';

    constructor(v: string, t: string) {
        this.val = v;
        this.txt = t;
    }
}

@Component({
    selector: 'app-bp-moyennes',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        FormsModule
    ],
    templateUrl: './bp-moyennes.component.html',
    styleUrl: './bp-moyennes.component.css'
})
export class BpMoyennesComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    bpTabel: BpMoyTabel = new BpMoyTabel();
    bssTabel: MoyenneTabel = new MoyenneTabel();
    existing: string[] = [];
    options: Option[] = [];
    option: Option = new Option('', '');
    escapeCount: number = 0;
    tableValid: boolean = false;

    buttons: Button[] = [
        new Button('', 'Ophalen moyenne tabel', false),
        new Button('', 'Opslaan in BSS', false)
    ];

    optionChanged() {
        this.bpTabel = new BpMoyTabel();
        this.bssTabel = new MoyenneTabel();
        this.tableValid = false;
    }

    buttonClicked(idx: number) {
        if (idx == 1) {
            this.opslaanClicked();
        }
        else {
            this.getMoyenneTabelFromBpoint();
        }
    }

    opslaanClicked() {
        this.bssTabel.tabId = '3BA-' + this.bpTabel.klasse;
        this.bssTabel.spelsoort = '3BA';
        this.bssTabel.klasse = this.bpTabel.klasse;
        this.bssTabel.minimum = Number(this.bpTabel.minimum);
        this.bpTabel.entries.forEach(entry => {
            const bssEntry: MoyenneTabelEntry = {
                vanaf: Number(entry.vanaf),
                cars: Number(entry.cars),
                filled: true
            }
            this.bssTabel.moyennes.push(bssEntry);
        });
        this.bssApi
    }

    getMoyenneTabelFromBpoint() {
        this.bssApi.getMoyenneTabelFromBiljartpoint(this.option.val)
        .then(result => {
            this.bpTabel = result;
            this.validateTable();
            if (!this.tableValid) {
                this.alert.showAlert('De data in de tabel is niet correct. Kan de tabel niet opslaan.', 'warning', 5);
            }
            else {
                const exists = this.existing.some(klasse => klasse == this.bpTabel.klasse);
                this.buttons[1].text = exists ? 'Wijzigen in BSS' : 'Toevoegen aan BSS';
            }
        })
        .catch(err => {
            this.alert.showError('ERROR - (zie console)');
            console.log(err);
        }) 
    }

    ngOnInit(): void {
        this.options.push(new Option('B1', 'Driebanden klein B1'));
        this.options.push(new Option('B2', 'Driebanden klein B2'));
        this.option = this.options[0];
        this.bssApi.getMoyenneKlassenLijst('3BA')
        .then(result => {
            this.existing = result;
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private validateTable() {
        this.tableValid = this.helper.isValidInteger(this.bpTabel.minimum);
        if (!this.tableValid) {
            return;
        }
        this.tableValid = this.bpTabel.entries.every(entry => {
            return this.helper.isValidNumber(entry.vanaf) && this.helper.isValidInteger(entry.cars);
        });
    }
}
