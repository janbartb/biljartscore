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
import { SpeechService } from '../../services/speech.service';

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
    spraak = inject(SpeechService);

    config: Config = new Config();
    spelsoorten: Spelsoort[] = [];
    districten: District[] = [];
    klassen: string[] = [];
    verenigingen: VerenigingKort[] = [];
    spraakTest: string = 'Dit is een test';
    buttons: Button[] = [
        new Button('Enter', 'Opslaan', true),
        new Button('', 'Randapparatuur', false)
    ];
    formCreated: boolean = false;
    voices: SpeechSynthesisVoice[] = [];

    configForm!: FormGroup;

    buttonPressed(idx: number) {
        if (idx == 0) {
            this.buttons[0].selected = true;
            setTimeout(() => {
                this.buttons[0].selected = false;
                this.buttonClicked(idx);
            }, 500);
        }
    }

    override escapePressed(): void {
        super.escapePressed();
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.enterClicked();
        }
        else if (idx == 1) {
            this.randApparatuurClicked();
        }
    }

    enterClicked() {
        if (this.configForm && this.configForm.valid) {
            this.configOpslaan();
        }
    }

    randApparatuurClicked() {
        this.appData.gotoPage(this.router.url, this.router.url + '/rand');
    }

    toggleRepeatRemaining() {
        if (this.speech?.value) {
            this.repeatRemaining?.setValue(!this.repeatRemaining.value);
        }
    }

    toggleSayGenoteerd() {
        if (this.speech?.value) {
            this.sayGenoteerd?.setValue(!this.sayGenoteerd.value);
        }
    }

    toggleSpeech() {
        this.speech?.setValue(!this.speech.value);
        if (this.speech?.value) {
            this.enableSpeechFields();
        }
        else {
            this.disableSpeechFields();
        }
    }

    private enableSpeechFields() {
        this.stem?.enable();
        this.speechTest?.enable();
        this.repeatRemaining?.enable();
        this.sayGenoteerd?.enable();
    }

    private disableSpeechFields() {
        this.stem?.disable();
        this.speechTest?.disable();
        this.repeatRemaining?.disable();
        this.sayGenoteerd?.disable();
    }

    spreekTest() {
        if (!this.speech?.value) {
            return;
        }
        this.spraak.setVoiceByName(this.stem?.value);
        this.spraak.speak(this.speechTest?.value);
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
        let cfg = this.appData.getConfig();
        if (cfg) {
            this.config = cfg;
        }
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
            if (!cfg) {
                this.config = results[4];
            }
            if (this.config.seizoen == '') {
                this.config.seizoen = this.appData.getSeizoen();
            }
            this.spraak.getVoices()
            .then((data => {
                this.voices = data;
                console.log(this.voices);
                this.createForm();
                if (!this.speech?.value) {
                    this.disableSpeechFields();
                }
            }));
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
        this.config.stem = this.stem?.value;
        this.config.repeatRemaining = this.repeatRemaining?.value;
        this.config.sayGenoteerd = this.sayGenoteerd?.value;
        this.bssApi.saveConfig(this.config)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.appData.setConfig(this.config);
            const foundSpelsoort = this.spelsoorten.find(s => s.spelsoortId == this.config.spelsoort);
            if (foundSpelsoort) {
                this.appData.setSpel(foundSpelsoort);
            }
            this.spraak.speechOn = this.config.speech;
            this.spraak.setVoiceByName(this.config.stem);
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
            stem: [this.config.stem],
            speechTest: [this.spraakTest],
            repeatRemaining: [this.config.repeatRemaining],
            sayGenoteerd: [this.config.sayGenoteerd]
        });
        this.formCreated = true;
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
    get stem() {
        return this.configForm.get('stem');
    }
    get speechTest() {
        return this.configForm.get('speechTest');
    }
    get repeatRemaining() {
        return this.configForm.get('repeatRemaining');
    }
    get sayGenoteerd() {
        return this.configForm.get('sayGenoteerd');
    }
}
