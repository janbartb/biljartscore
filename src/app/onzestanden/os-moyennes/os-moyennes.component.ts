import { Component, HostListener, inject, OnInit } from '@angular/core';
import { BpMoyTabel, BpMoyTabelEntry } from '../../model/bpoint';
import { MoyenneTabel, MoyenneTabelEntry } from '../../model/moyenne-tabel';
import { BaseComponent } from '../../base/base.component';
import { HelperService } from '../../services/helper.service';
import { Config } from '../../model/config';
import { Button } from '../../model/button';
import { ApiResponse } from '../../model/api-response';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgClass, SlicePipe } from '@angular/common';
import { District } from '../../model/district';
import { KnbbCompetitie } from '../../model/knbb-competitie';

class Option {
    val: string = '';
    txt: string = '';

    constructor(v: string, t: string) {
        this.val = v;
        this.txt = t;
    }
}

class MoyEntry {
    bp: BpMoyTabelEntry = new BpMoyTabelEntry();
    bpNum: MoyenneTabelEntry = new MoyenneTabelEntry();
    bss: BpMoyTabelEntry = new BpMoyTabelEntry();
    bssNum: MoyenneTabelEntry = new MoyenneTabelEntry();
    bssOk: boolean = true;
}

@Component({
    selector: 'app-os-moyennes',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        FormsModule,
        SlicePipe,
        DecimalPipe,
        NgClass
    ],
    templateUrl: './os-moyennes.component.html',
    styleUrl: './os-moyennes.component.css'
})
export class OsMoyennesComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);

    district: District = new District();
    competities: KnbbCompetitie[] = [];
    bpTabel: BpMoyTabel = new BpMoyTabel();
    bssTabel: MoyenneTabel = new MoyenneTabel();
    comboTabel: MoyEntry[] = [];
    existing: string[] = [];
    config: Config = new Config();
    voorkeur: boolean = false;
    options: Option[] = [];
    option: Option = new Option('', '');
    tabelInBssIsOk: boolean = true;
    tableValid: boolean = false;
    status: string = 'success';

    buttons: Button[] = [
        new Button('', 'Ophalen moyenne tabel', false),
        new Button('', 'Opslaan in BSS', false)
    ];

    optionChanged() {
        this.bpTabel = new BpMoyTabel();
        this.bssTabel = new MoyenneTabel();
        this.comboTabel = [];
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

    voorkeurClicked() {
        this.voorkeur = !this.voorkeur;
    }

    opslaanClicked() {
        this.bssTabel.tabId = '3BA-' + this.bpTabel.klasse;
        this.bssTabel.spelsoort = '3BA';
        this.bssTabel.klasse = this.bpTabel.klasse;
        this.bssTabel.minimum = +this.bpTabel.minimum;
        this.bssTabel.moyennes = [];
        this.bpTabel.entries.forEach(entry => {
            const bssEntry: MoyenneTabelEntry = {
                vanaf: +entry.vanaf,
                cars: +entry.cars,
                filled: true
            }
            this.bssTabel.moyennes.push(bssEntry);
        });
        const exists = this.existing.some(kl => kl == this.bssTabel.klasse);
        if (exists) {
            this.tabelWijzigen();
        }
        else {
            this.tabelToevoegen();
        }
    }

    private tabelToevoegen() {
        let promises: Promise<ApiResponse>[] = [this.bssApi.addMoyenneTabel(this.bssTabel)];
        if (this.voorkeur) {
            this.config.klasse = this.bssTabel.klasse;
            promises.push(this.bssApi.saveConfig(this.config));
        }
        Promise.all(promises)
        .then(resps => {
            this.alert.showAlert(`Moyenne tabel voor klasse '${this.bssTabel.klasse}' is toegevoegd.`, 'success');
            this.bssTabel = resps[0].data;
            this.existing.push(this.bssTabel.klasse);
            this.tabelInBssIsOk = true;
            this.fillComboTabel();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private tabelWijzigen() {
        let promises: Promise<ApiResponse>[] = [this.bssApi.updateMoyenneTabel(this.bssTabel)];
        if (this.voorkeur) {
            this.config.klasse = this.bssTabel.klasse;
            promises.push(this.bssApi.saveConfig(this.config));
        }
        Promise.all(promises)
        .then(resps => {
            this.alert.showAlert(`Moyenne tabel voor klasse '${this.bssTabel.klasse}' is gewijzigd.`, 'success');
            this.bssTabel = resps[0].data;
            this.tabelInBssIsOk = true;
            this.fillComboTabel();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    getMoyenneTabelFromBpoint() {
        const compIdx = this.competities.findIndex(cmp => cmp.klasse == this.option.val);
        if (compIdx < 0) {
            this.alert.showAlert('Geen KNBB competitie gevonden voor de opgegeven klasse.', 'warning', 5);
            return;
        }
        this.status = 'loading';
        const cmp = this.competities[compIdx];
        this.voorkeur = false;
        this.bssApi.getMoyenneTabelFromOnzestanden(this.option.val, cmp.osKlasse, cmp.osComp)
        .then(result => {
            this.bpTabel = result;
            this.bpTabel.entries.forEach(entry => {
                entry.vanaf = entry.vanaf.replace(',', '.');
            });
            this.validateTable();
            if (!this.tableValid) {
                this.alert.showAlert('De data in de tabel is niet correct. Kan de tabel niet opslaan.', 'warning', 5);
            }
            else {
                const exists = this.existing.some(klasse => klasse == this.bpTabel.klasse);
                this.buttons[1].text = exists ? 'Wijzigen in BSS' : 'Toevoegen aan BSS';
                if (exists) {
                    this.bssApi.getMoyenneTabel('3BA-' + this.option.val)
                    .then(data => {
                        this.bssTabel = data;
                        this.fillComboTabel();
                        if (+this.bpTabel.minimum != this.bssTabel.minimum) {
                            this.tabelInBssIsOk = false;
                        }
                        this.status = 'success';
                    })
                    .catch(err => {
                        this.alert.showError(err);
                    });
                }
                else {
                    this.bssTabel = new MoyenneTabel();
                    this.tabelInBssIsOk = false;
                    this.fillComboTabel();
                    this.status = 'success';
                }
            }
        })
        .catch(err => {
            this.status = 'error';
            this.alert.showError('ERROR - (zie console)');
            console.log(err);
        });
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
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
        this.district = this.appData.getDistrict();
        if (this.district.disId == '') {
            this.alert.showAlert('Er is geen voorkeurdistrict opgegeven bij de instellingen.', 'warning', 5);
            return;
        }

        this.options.push(new Option('B1', 'Driebanden klein B1'));
        this.options.push(new Option('B2', 'Driebanden klein B2'));
        this.option = this.options[0];
        Promise.all([
            this.bssApi.getKnbbCompetities(this.district.disId, this.spelId),
            this.bssApi.getMoyenneKlassenLijst('3BA'),
            this.bssApi.getConfig()
        ])
        .then(results => {
            this.competities = results[0];
            this.existing = results[1];
            this.config = results[2];
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private fillComboTabel() {
        this.comboTabel = [];
        let eofBp = this.bpTabel.entries.length == 0;
        let eofBss = this.bssTabel.moyennes.length == 0;
        let keyBp = eofBp ? 99999 : 0;
        let keyBss = eofBss ? 99999 : 0;
        let idxBp = -1;
        let idxBss = -1;
        let comboTemp = new MoyEntry();
        while(!(eofBp && eofBss)) {
            if (keyBp == keyBss) {
                idxBp++;
                idxBss++;
                comboTemp.bp = this.bpTabel.entries[idxBp];
                comboTemp.bpNum = this.getNumericEntry(comboTemp.bp);
                keyBp = comboTemp.bpNum.vanaf;
                comboTemp.bssNum = this.bssTabel.moyennes[idxBss];
                comboTemp.bss = this.getStringEntry(comboTemp.bssNum);
                keyBss = comboTemp.bssNum.vanaf;
            }
            else if (keyBp < keyBss) {
                idxBp++;
                comboTemp.bp = this.bpTabel.entries[idxBp];
                comboTemp.bpNum = this.getNumericEntry(comboTemp.bp);
                keyBp = comboTemp.bpNum.vanaf;
            }
            else {
                idxBss++;
                comboTemp.bssNum = this.bssTabel.moyennes[idxBss];
                comboTemp.bss = this.getStringEntry(comboTemp.bssNum);
                keyBss = comboTemp.bssNum.vanaf;
            }
            let comboEntry = new MoyEntry();
            if (keyBp == keyBss) {
                comboEntry.bp = comboTemp.bp;
                comboEntry.bpNum = comboTemp.bpNum;
                comboEntry.bss = comboTemp.bss;
                comboEntry.bssNum = comboTemp.bssNum;
                this.comboTabel.push(comboEntry);
                eofBp = (idxBp + 1) >= this.bpTabel.entries.length;
                eofBss = (idxBss + 1) >= this.bssTabel.moyennes.length;
                keyBp = eofBp ? 99999 : keyBp;
                keyBss = eofBss ? 99999 : keyBss;
            }
            else if (keyBp > keyBss) {
                comboEntry.bss = comboTemp.bss;
                comboEntry.bssNum = comboTemp.bssNum;
                this.comboTabel.push(comboEntry);
                eofBss = (idxBss + 1) >= this.bssTabel.moyennes.length;
                keyBss = eofBss ? 99999 : keyBss;
                if (eofBss && !eofBp) {
                    let comboEntry = new MoyEntry();
                    comboEntry.bp = comboTemp.bp;
                    comboEntry.bpNum = comboTemp.bpNum;
                    comboEntry.bssOk = false;
                    this.comboTabel.push(comboEntry); 
                    eofBp = (idxBp + 1) >= this.bpTabel.entries.length;
                    keyBp = eofBp ? 99999 : keyBp;   
                }
            }
            else {
                comboEntry.bp = comboTemp.bp;
                comboEntry.bpNum = comboTemp.bpNum;
                this.comboTabel.push(comboEntry);
                eofBp = (idxBp + 1) >= this.bpTabel.entries.length;
                keyBp = eofBp ? 99999 : keyBp;
                if (eofBp && !eofBss) {
                    let comboEntry = new MoyEntry();
                    comboEntry.bss = comboTemp.bss;
                    comboEntry.bssNum = comboTemp.bssNum;
                    comboEntry.bssOk = false;
                    this.comboTabel.push(comboEntry);
                    eofBss = (idxBss + 1) >= this.bssTabel.moyennes.length;
                    keyBss = eofBss ? 99999 : keyBss;
                }
            }
            if (comboEntry.bpNum.vanaf != comboEntry.bssNum.vanaf || comboEntry.bpNum.cars != comboEntry.bssNum.cars) {
                comboEntry.bssOk = false;
                this.tabelInBssIsOk = false;
            }
        }
        // aanvullen tot 40 entries
        if (this.comboTabel.length > 40) {
            this.comboTabel.length = 40;
        }
        const nrToAdd = 40 - this.comboTabel.length;
        for (let i = 0; i < nrToAdd; i++) {
            this.comboTabel.push(new MoyEntry());
        }
    }

    private getStringEntry(entry: MoyenneTabelEntry): BpMoyTabelEntry {
        let result = new BpMoyTabelEntry();
        result.vanaf = entry.vanaf == 0 ? '' : '' + entry.vanaf;
        result.cars = entry.cars == 0 ? '' : '' + entry.cars;
        return result;
    }

    private getNumericEntry(entry: BpMoyTabelEntry): MoyenneTabelEntry {
        let result = new MoyenneTabelEntry();
        result.vanaf = entry.vanaf == '' ? 0 : +entry.vanaf;
        result.cars = entry.cars == '' ? 0 : +entry.cars;
        return result;
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
