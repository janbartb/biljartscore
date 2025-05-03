import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { BaseComponent } from '../../../base/base.component';
import { BpDistrict } from '../../../model/bpoint';
import { District } from '../../../model/district';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { Button } from '../../../model/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { noDuplicates, notEmpty } from '../../../directives/validators.directive';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-bp-district',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './bp-district.component.html',
    styleUrl: './bp-district.component.css'
})
export class BpDistrictComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    district: BpDistrict = new BpDistrict();
    bssDistrict: District = new District();
    existing: string[] = [];
    defaultId: string = this.appData.getDistrict().disId;
    subtitle: string = '';
    isAddMode: boolean = true;
    districtChanged: boolean = false;
    inputOk: boolean = false;
    districtForm!: FormGroup;

    buttons: Button[] = [
        new Button('', 'Toevoegen aan BSS', false)
    ];

    htmlInputId = viewChild<ElementRef<HTMLInputElement>>("bssid");
    htmlInputNaam = viewChild<ElementRef<HTMLInputElement>>("bssnaam");

    constructor() {
        super();
        effect(() => {
            this.htmlInputNaam()?.nativeElement.focus();
            this.htmlInputId()?.nativeElement.focus();
        });
    }

    voorkeurChanged() {
        this.voorkeur?.setValue(!this.voorkeur.value);
        //this.hasDistrictChanged();
    }

    opslaanClicked() {
        if (this.isAddMode) {
            this.districtToevoegen();
        }
        else {
            this.districtWijzigen();
        }
    }

    private districtToevoegen() {
        this.bssDistrict.disId = this.disId?.value;
        this.bssDistrict.knbbId = this.district.knbbId;
        this.bssDistrict.disNaam = this.disNaam?.value;
        this.bssApi.addDistrict(this.bssDistrict)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.zetVoorkeurDistrict();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private districtWijzigen() {
        this.bssDistrict.disNaam = this.disNaam?.value;
        this.bssApi.updateDistrict(this.bssDistrict)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.zetVoorkeurDistrict();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private zetVoorkeurDistrict() {
        if (this.voorkeur?.value && !this.district.isDefault) {
            this.bssApi.getConfig()
            .then(conf => {
                conf.district = this.bssDistrict;
                this.bssApi.saveConfig(conf)
                .then(resp => {
                    this.alert.showAlert('Voorkeur district succesvol gezet', 'success');
                    this.appData.setConfig(conf);
                    super.escapePressed();
                })
                .catch(err => {
                    this.alert.showError(err);
                });
             })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        else {
            super.escapePressed();
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        // if (event.key === 'Enter') {
        //     this.enterPressed();
        //     return false;
        // }
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
        const data = localStorage.getItem('distr');
        if (data) {
            this.district = JSON.parse(data);
            if (!this.district.isDefault) {
                this.district.isDefault = false;
            }
            this.subtitle = `District '${this.district.knbbId}'`;
            if (this.district.bssId && this.district.bssId != '') {
                this.isAddMode = false;
                this.buttons[0].text = 'Wijzigen in BSS';
            }
            if (this.isAddMode) {
                this.bssApi.getKnbbDistricten()
                .then(result => {
                    this.existing = result.map(dis => dis.disId);
                    this.createDistrictForm();
                    this.disNaam?.setValue(this.district.naam);
                })
                .catch(err => {
                    this.alert.showError(err);
                });        
            }
            else {
                this.bssApi.getKnbbDistrict(this.district.bssId)
                .then(result => {
                    this.bssDistrict = result;
                    this.createDistrictForm();
                })
                .catch(err => {
                    this.alert.showError(err);
                });        
            }
        }
        else {
            this.subtitle = 'District onbekend';
            this.alert.showAlert('Geen district geselecteerd. Ga eerst naar Biljartpoint / Districten.', 'warning', 5);
        }
    }

    private createDistrictForm() {
        this.districtForm = this.fb.nonNullable.group({
            disId: [this.bssDistrict.disId, [Validators.required, notEmpty(), noDuplicates(this.existing)]],
            disNaam: [this.bssDistrict.disNaam, [Validators.required, notEmpty(), Validators.maxLength(30)]],
            voorkeur: [this.district.isDefault]
        });
        if (this.isAddMode) {
            //this.disId?.setValidators([Validators.required, notEmpty(), noDuplicates(this.existing)]);
            this.disId?.valueChanges.subscribe(val => {
                this.hasDistrictChanged();
            });
        }
        else {
            this.disId?.disable();
        }
        this.disNaam?.valueChanges.subscribe(val => {
            this.hasDistrictChanged();
        });
        this.voorkeur?.valueChanges.subscribe(val => {
            this.hasDistrictChanged();
        });
}

    private hasDistrictChanged() {
        this.districtChanged = false;
        if (this.disId?.value != this.bssDistrict.disId || this.disNaam?.value != this.bssDistrict.disNaam || this.voorkeur?.value != this.district.isDefault) {
            this.districtChanged = true;
        }
    }

    get disId() {
        return this.districtForm.get('disId');
    }
    get disNaam() {
        return this.districtForm.get('disNaam');
    }
    get voorkeur() {
        return this.districtForm.get('voorkeur');
    }
}
