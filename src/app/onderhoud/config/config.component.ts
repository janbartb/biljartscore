import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Config } from '../../model/config';
import { BaseComponent } from '../../base/base.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';
import { Button } from '../../model/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { VerenigingKort } from '../../model/vereniging';
import { Spelsoort } from '../../model/spelsoort';
import { District } from '../../model/district';

declare var mySpeechObject: any;

@Component({
    selector: 'app-config',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './config.component.html',
    styleUrl: './config.component.css'
})
export class ConfigComponent extends BaseComponent implements OnInit {
    fb = inject(FormBuilder);

    config: Config = new Config();
    spelsoorten: Spelsoort[] = [];
    districten: District[] = [];
    klassen: string[] = [];
    verenigingen: VerenigingKort[] = [];
    spraakTest: string = 'Dit is een test';
    buttons: Button[] = [new Button('Enter', 'Opslaan', true)];
    formCreated: boolean = false;

    configForm!: FormGroup;

    buttonPressed(idx: number) {
        if (idx == 0) {
            this.buttons[0].selected = true;
            setTimeout(() => {
                this.buttons[0].selected = false;
                this.enterClicked();
            }, 500);
        }
    }

    override escapePressed(): void {
        super.escapePressed();
    }

    enterClicked() {
        if (this.configForm && this.configForm.valid) {
            this.configOpslaan();
        }
    }

    toggleSpeech() {
        this.speech?.setValue(!this.speech.value);
        if (this.speech?.value) {
            this.speechTest?.enable();
        }
        else {
            this.speechTest?.disable();
        }
    }

    spreekTest() {
        if (!this.speech?.value) {
            return;
        }
        mySpeechObject.speak(this.speechTest?.value);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(0);
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
        return true;
    }

    ngOnInit(): void {
        Promise.all([
            this.bssApi.getSpelsoorten(),
            this.bssApi.getKnbbDistricten(),
            this.bssApi.getMoyenneKlassenLijst(this.spelId),
            this.bssApi.getVerenigingenKort(),
            this.bssApi.getConfig()
        ])
        .then(results => {
            this.spelsoorten = results[0];
            this.districten = results[1];
            this.klassen = results[2];
            this.verenigingen = results[3];
            this.config = results[4];
            this.createForm();
        })
        .catch((err) => {
            this.alert.showAlert(err, 'error');
        })
    }

    private configOpslaan() {
        this.config.spelsoort = this.spelsoort?.value;
        this.config.seizoen = this.seizoen?.value;
        const foundDistrict = this.districten.find(d => d.disId == this.district?.value);
        if (foundDistrict) {
            this.config.district = foundDistrict;
        }
        this.config.klasse = this.klasse?.value;
        this.config.vereniging = this.vereniging?.value;
        this.config.speech = this.speech?.value;
        this.bssApi.saveConfig(this.config)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.appData.setConfig(this.config);
            const foundSpelsoort = this.spelsoorten.find(s => s.spelsoortId == this.config.spelsoort);
            if (foundSpelsoort) {
                this.appData.setSpel(foundSpelsoort);
            }
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private createForm() {
        this.configForm = this.fb.nonNullable.group({
            spelsoort: [this.config.spelsoort, [Validators.required]],
            seizoen: [this.config.seizoen],
            district: [this.config.district.disId],
            klasse: [this.config.klasse],
            vereniging: [this.config.vereniging],
            speech: [this.config.speech],
            speechTest: [this.spraakTest]
        });
        this.formCreated = true;
        console.log(this.configForm);
    }

    get spelsoort() {
        return this.configForm.get('spelsoort');
    }
    get seizoen() {
        return this.configForm.get('seizoen');
    }
    get district() {
        return this.configForm.get('district');
    }
    get klasse() {
        return this.configForm.get('klasse');
    }
    get vereniging() {
        return this.configForm.get('vereniging');
    }
    get speech() {
        return this.configForm.get('speech');
    }
    get speechTest() {
        return this.configForm.get('speechTest');
    }
}
