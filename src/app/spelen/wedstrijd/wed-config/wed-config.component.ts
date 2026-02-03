import { Component, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../model/button';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { ActivatedRoute } from '@angular/router';
import { Wedstrijd } from '../../../model/wedstrijd';
import { MoyenneTabel } from '../../../model/moyenne-tabel';
import { HelperService } from '../../../services/helper.service';
import { isModuloVijf } from '../../../directives/validators.directive';

@Component({
    selector: 'app-wed-config',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './wed-config.component.html',
    styleUrl: './wed-config.component.css'
})
export class WedConfigComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);
    helper = inject(HelperService);
    title: string = 'Wedstrijd spelen';
    subtitle: string = 'Oefen wedstrijd - instellingen';
    wedstrijd: Wedstrijd = new Wedstrijd();
    regelOpties: string[] = [];
    telOpties: string[] = [];
    knbbKlassen: string[] = [];
    moyTabel: MoyenneTabel = new MoyenneTabel();
    gewijzigd: boolean = false;
    configOk: boolean = true;

    buttons: Button[] = [
        new Button('Enter', 'Naar wedstrijd', true),
        new Button('Enter', 'Opslaan en naar wedstrijd', true)
    ];

    configForm!: FormGroup;

    override escapePressed(): void {
        if (this.escapeCount == 1) {
            this.createConfigForm();
            this.gewijzigd = false;
            this.configOk = true;
            this.escapeCount = 0;
            return;
        }
        this.previousPressed();
    }

    override previousPressed(): void {
        this.router.navigate(['wedstrijd/spelers']);
    }

    buttonPressed(button: Button) {
        if (!this.configForm || !this.configForm.valid) {
            return;
        }
        this.checkInput();
        if (!this.configOk) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            this.buttonClicked(button.text.includes('Opslaan') ? 1 : 0);
        }, 300);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.gaVerderClicked();
        }
        else {
            this.opslaanClicked();
        }
    }

    opslaanClicked() {
        this.helper.clearWedstrijdStanden(this.wedstrijd);
        this.fillWedstrijdFromFormAndSave();
    }

    gaVerderClicked() {
        if (!this.isSpelerDataGevuld()) {
            this.opslaanClicked();
        }
        else {
            this.router.navigate(['wedstrijd']);
        }
    }

    regelOptieClicked(idx: number) {
        this.wedIdxRegels?.setValue(idx);
        if (idx == 0) {
            this.wedMaxBrt?.setValue(60);
            this.wedIdxTelling?.setValue(0);
        }
        else {
            this.wedMaxBrt?.setValue(0);
        }
        if (idx == 1) {
            this.wedIdxTelling?.setValue(1);
        }
        this.enableDisableFields();
        this.checkInput();
        this.setGewijzigd();
    }

    telOptieClicked(idx: number) {
        this.wedIdxTelling?.setValue(idx);
        this.checkInput();
        this.setGewijzigd();
    }

    checkInput() {
        this.setGewijzigd();
        this.configOk = this.inputOk();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return false;
        }
        if (event.key === 'Enter') {
            if (this.gewijzigd) {
                this.buttonPressed(this.buttons[1]);
            }
            else {
                this.buttonPressed(this.buttons[0]);
            }
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
            this.bssApi.getWedstrijd(),
            this.bssApi.getMoyenneKlassenLijst(this.spelId)
        ])
        .then(results => {
            if (results[0].gevonden) {
                this.wedstrijd = results[0].wedstrijd;
            }
            if (this.wedstrijd.aantSpelers == 0) {
                this.router.navigate(['wedstrijd/aantspl']);
                return;
            } 
            if (this.wedstrijd.regels.idxOptie == 4) {
                this.subtitle = 'Wedstrijd - instellingen';
            }
            this.knbbKlassen = results[1];
            this.createConfigForm();
            if (this.wedstrijd.aantSpelers == 5) {
                this.regelOpties.push('Aantal caramboles teams o.b.v. KNBB tabel driebanden klein, klasse');
                this.regelOpties.push('Vast aantal beurten voor iedere speler');
                this.regelOpties.push('Vast aantal caramboles voor ieder team');
                this.regelOpties.push('Aantal caramboles o.b.v. moyenne team en');
                this.regelOpties.push('caramboles libre met iedere 5e carambole een driebander');
            }
            else {
                this.regelOpties.push('Aantal caramboles spelers o.b.v. KNBB tabel driebanden klein, klasse');
                this.regelOpties.push('Vast aantal beurten voor iedere speler');
                this.regelOpties.push('Vast aantal caramboles voor iedere speler');
                this.regelOpties.push('Aantal caramboles o.b.v. moyenne speler en');
                this.regelOpties.push('caramboles libre met iedere 5e carambole een driebander');
            }

            this.telOpties.push('KNBB match telling (1 punt per 10% van te spelen caramboles)');
            this.telOpties.push('Eigen telling');
            this.telOpties.push('1 punt per 5 caramboles');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private isSpelerDataGevuld(): boolean {
        if (this.wedstrijd.aantSpelers == 5) {
            return this.wedstrijd.teams[0].teamTsCar > 0 || this.wedstrijd.teams[0].teamTsBrt > 0;
        }
        else {
            return this.wedstrijd.spelers[0].splTsCar > 0 || this.wedstrijd.spelers[0].splTsBrt > 0;
        }
    }

    private setGewijzigd() {
        this.gewijzigd = this.wedIdxRegels?.value != this.wedstrijd.regels.idxOptie ||
                        this.wedKlasse?.value != this.wedstrijd.regels.knbbKlasse ||
                        this.wedAantBrt?.value != this.wedstrijd.regels.vastAantBrt ||
                        this.wedAantCar?.value != this.wedstrijd.regels.vastAantCar ||
                        this.wedVijfdeCar?.value != this.wedstrijd.regels.vijfdeAantCar ||
                        this.wedMoyBrt?.value != this.wedstrijd.regels.moyAantBrt ||
                        this.wedMaxBrt?.value != this.wedstrijd.regels.maxBeurten ||
                        this.wedIdxTelling?.value != this.wedstrijd.telling.idxOptie ||
                        this.wedPntWinst?.value != this.wedstrijd.telling.winstPunten ||
                        this.wedPntGelijk?.value != this.wedstrijd.telling.gelijkPunten ||
                        this.wedPntBovenMoy?.value != this.wedstrijd.telling.bovenMoyPunten
        this.escapeCount = this.gewijzigd ? 1 : 0;
    }

    private inputOk(): boolean {
        if (this.wedIdxRegels?.value == 0) {
            if (this.wedKlasse?.value == '') {
                return false;
            }
        }
        else if (this.wedIdxRegels?.value == 1) {
            if (this.wedAantBrt?.value <= 0) {
                return false;
            }
        }
        else if (this.wedIdxRegels?.value == 2) {
            if (this.wedAantCar?.value <= 0) {
                return false;
            }
        }
        else if (this.wedIdxRegels?.value == 3) {
            if (this.wedMoyBrt?.value <= 0) {
                return false;
            }
        }
        else if (this.wedIdxRegels?.value == 4) {
            if (this.wedVijfdeCar?.value <= 0 || this.wedVijfdeCar?.value % 5 != 0) {
                return false;
            }
        }
        if (this.wedIdxTelling?.value == 1) {
            if (this.wedPntWinst?.value < 0 || this.wedPntGelijk?.value < 0 || this.wedPntBovenMoy?.value < 0) {
                return false;
            }
        }
        return true;
    }

    private enableDisableFields() {
        if (!this.configForm) {
            return;
        }
        if (this.wedIdxRegels?.value == 0) {
            this.wedKlasse?.enable();
            this.wedAantBrt?.disable();
            this.wedAantCar?.disable();
            this.wedMoyBrt?.disable();
            this.wedVijfdeCar?.disable();
        }
        else if (this.wedIdxRegels?.value == 1) {
            this.wedKlasse?.disable();
            this.wedAantBrt?.enable();
            this.wedAantCar?.disable();
            this.wedMoyBrt?.disable();
            this.wedVijfdeCar?.disable();
        }
        else if (this.wedIdxRegels?.value == 2) {
            this.wedKlasse?.disable();
            this.wedAantBrt?.disable();
            this.wedAantCar?.enable();
            this.wedMoyBrt?.disable();
            this.wedVijfdeCar?.disable();
        }
        else if (this.wedIdxRegels?.value == 3) {
            this.wedKlasse?.disable();
            this.wedAantBrt?.disable();
            this.wedAantCar?.disable();
            this.wedMoyBrt?.enable();
            this.wedVijfdeCar?.disable();
        }
        else if (this.wedIdxRegels?.value == 4) {
            this.wedKlasse?.disable();
            this.wedAantBrt?.disable();
            this.wedAantCar?.disable();
            this.wedMoyBrt?.disable();
            this.wedVijfdeCar?.enable();
        }
    }

    private fillWedstrijdFromFormAndSave() {
        this.wedstrijd.regels.idxOptie = this.wedIdxRegels?.value;
        if (this.wedstrijd.regels.idxOptie == 0) {
            this.wedstrijd.regels.knbbKlasse = this.wedKlasse?.value;
            this.wedstrijd.regels.maxBeurten = this.wedMaxBrt?.value;
        }
        else if (this.wedstrijd.regels.idxOptie == 1) {
            this.wedstrijd.regels.vastAantBrt = this.wedAantBrt?.value;
            this.wedstrijd.regels.maxBeurten = this.wedstrijd.regels.vastAantBrt;            
        }
        else if (this.wedstrijd.regels.idxOptie == 2) {
            this.wedstrijd.regels.vastAantCar = this.wedAantCar?.value;
            this.wedstrijd.regels.maxBeurten = this.wedMaxBrt?.value;            
        }
        else if (this.wedstrijd.regels.idxOptie == 3) {
            this.wedstrijd.regels.moyAantBrt = this.wedMoyBrt?.value;
            this.wedstrijd.regels.maxBeurten = this.wedMaxBrt?.value;            
        }
        else if (this.wedstrijd.regels.idxOptie == 4) {
            this.wedstrijd.regels.vijfdeAantCar = this.wedVijfdeCar?.value;
            this.wedstrijd.regels.maxBeurten = this.wedMaxBrt?.value;            
        }
        this.wedstrijd.telling.idxOptie = this.wedIdxTelling?.value;
        if (this.wedstrijd.telling.idxOptie == 1) {
            this.wedstrijd.telling.winstPunten = this.wedPntWinst?.value;
            this.wedstrijd.telling.gelijkPunten = this.wedPntGelijk?.value;
        }
        this.wedstrijd.telling.bovenMoyPunten = this.wedPntBovenMoy?.value;
        this.fillTeSpelenCarambolesAndBeurten();
    }

    private fillTeSpelenCarambolesAndBeurten() {
        if (this.wedstrijd.regels.idxOptie == 1) {
            this.setVastCarambolesAndBeurten(0, this.wedstrijd.regels.vastAantBrt);
            this.saveWedstrijdEnGaVerder();
            return;
        }
        if (this.wedstrijd.regels.idxOptie == 2) {
            this.setVastCarambolesAndBeurten(this.wedstrijd.regels.vastAantCar, 0);
            this.saveWedstrijdEnGaVerder();
            return;
        }
        if (this.wedstrijd.regels.idxOptie == 3) {
            this.berekenAantalCaramboles();
            this.saveWedstrijdEnGaVerder();
            return;
        }
        if (this.wedstrijd.regels.idxOptie == 4) {
            this.setVastCarambolesAndBeurten(this.wedstrijd.regels.vijfdeAantCar, 0);
            this.saveWedstrijdEnGaVerder();
            return;
        }
        this.bepaalAantalCarambolesViaTabel();
    }

    private bepaalAantalCarambolesViaTabel() {
        if (this.moyTabel.klasse == this.wedstrijd.regels.knbbKlasse) {
            this.getAantalCarambolesUitTabel();
            this.saveWedstrijdEnGaVerder();
        }
        else {
            this.bssApi.getMoyenneTabel(this.spelId + '-' + this.wedstrijd.regels.knbbKlasse)
            .then(data => {
                this.moyTabel = data;
                this.getAantalCarambolesUitTabel();
                this.saveWedstrijdEnGaVerder();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
    }

    private getAantalCarambolesUitTabel() {
        if (this.wedstrijd.aantSpelers == 5) {
            this.wedstrijd.teams.forEach(team => {
                team.teamTsMoy = (team.spelers[0].splTsMoy + team.spelers[1].splTsMoy) / 2;
                team.teamTsCar = this.getAantalCarsFromTabel(team.teamTsMoy);
                team.teamTsBrt = 0;
                const ratio = team.spelers[0].splTsMoy / (team.spelers[0].splTsMoy + team.spelers[1].splTsMoy);
                team.spelers[0].splTsCar = Math.round(ratio * team.teamTsCar);
                team.spelers[1].splTsCar = team.teamTsCar - team.spelers[0].splTsCar;
                team.spelers[0].splTsBrt = team.spelers[1].splTsBrt = 0;
            });
        }
        else {
            this.wedstrijd.spelers.forEach(spl => {
                spl.splTsCar = this.getAantalCarsFromTabel(spl.splTsMoy);
                spl.splTsBrt = 0;
            });
        }
    }

    private berekenAantalCaramboles() {
        if (this.wedstrijd.aantSpelers == 5) {
            this.wedstrijd.teams.forEach(team => {
                team.teamTsMoy = (team.spelers[0].splTsMoy + team.spelers[1].splTsMoy) / 2;
                team.teamTsBrt = 0;
                team.teamTsCar = Math.round(team.teamTsMoy * this.wedstrijd.regels.moyAantBrt);
                const ratio = team.spelers[0].splTsMoy / (team.spelers[0].splTsMoy + team.spelers[1].splTsMoy);
                team.spelers[0].splTsCar = Math.round(ratio * team.teamTsCar);
                team.spelers[1].splTsCar = team.teamTsCar - team.spelers[0].splTsCar;
                team.spelers[0].splTsBrt = team.spelers[1].splTsBrt = 0;
            });
        }
        else {
            this.wedstrijd.spelers.forEach(spl => {
                spl.splTsBrt = 0;
                spl.splTsCar = Math.round(spl.splTsMoy * this.wedstrijd.regels.moyAantBrt);
            });
        }
    }

    private setVastCarambolesAndBeurten(car: number, brt: number) {
        if (this.wedstrijd.aantSpelers == 5) {
            this.wedstrijd.teams.forEach(team => {
                team.teamTsMoy = (team.spelers[0].splTsMoy + team.spelers[1].splTsMoy) / 2;
                if (car > 0) {
                    team.teamTsCar = car;
                    team.teamTsBrt = 0;
                    const ratio = team.spelers[0].splTsMoy / (team.spelers[0].splTsMoy + team.spelers[1].splTsMoy);
                    team.spelers[0].splTsCar = Math.round(ratio * car);
                    team.spelers[1].splTsCar = car - team.spelers[0].splTsCar;
                    team.spelers[0].splTsBrt = team.spelers[1].splTsBrt = 0;
                    if (this.wedstrijd.regels.idxOptie == 4) {
                        team.teamTsMoy = 2 * team.teamTsMoy;
                        team.spelers.forEach(spl => {
                            spl.splTsMoy = 2 * spl.splTsMoy;
                        });
                    }
                }
                else {
                    team.teamTsBrt = 2 * brt;
                    team.teamTsCar = 0;
                    team.spelers.forEach(spl => {
                        spl.splTsBrt = brt;
                        spl.splTsCar = 0;
                    });
                }
            });
        }
        else {
            this.wedstrijd.spelers.forEach(spl => {
                if (this.wedstrijd.regels.idxOptie == 4) {
                    spl.splTsMoy = 2 * spl.splTsMoy;
                }
                spl.splTsCar = car;
                spl.splTsBrt = brt;
            });
        }
    }

    private getAantalCarsFromTabel(moy: number): number {
        let result = this.moyTabel.minimum;
        this.moyTabel.moyennes.every(entry => {
            if (moy >= entry.vanaf) {
                result = entry.cars;
                return true;
            }
            return false;
        });
        return result;
    }

    private saveWedstrijdEnGaVerder() {
        this.bssApi.saveWedstrijd(this.wedstrijd)
        .then(result => {
            this.router.navigate(['wedstrijd']);
        })
        .catch(err => {
            this.alert.showError(err);
        });

    }

    private createConfigForm() {
        this.configForm = this.fb.nonNullable.group({
            wedKlasse: [this.wedstrijd.regels.knbbKlasse],
            wedAantBrt: [this.wedstrijd.regels.vastAantBrt, [Validators.required, Validators.min(1)]],
            wedAantCar: [this.wedstrijd.regels.vastAantCar, [Validators.required, Validators.min(1)]],
            wedVijfdeCar: [this.wedstrijd.regels.vijfdeAantCar, [Validators.required, Validators.min(5), isModuloVijf()]],
            wedMaxBrt: [this.wedstrijd.regels.maxBeurten, [Validators.required, Validators.min(0)]],
            wedMoyBrt: [this.wedstrijd.regels.moyAantBrt, [Validators.required, Validators.min(1)]],
            wedPntWinst: [this.wedstrijd.telling.winstPunten, [Validators.required, Validators.min(0)]],
            wedPntGelijk: [this.wedstrijd.telling.gelijkPunten, [Validators.required, Validators.min(0)]],
            wedPntBovenMoy: [this.wedstrijd.telling.bovenMoyPunten, [Validators.required, Validators.min(0)]],
            wedIdxRegels: [this.wedstrijd.regels.idxOptie],
            wedIdxTelling: [this.wedstrijd.telling.idxOptie]
        });
        this.configForm.valueChanges.subscribe(val => {
            this.checkInput();
        })
        this.enableDisableFields();
    }

    get wedAantBrt() {
        return this.configForm.get('wedAantBrt');
    }
    get wedAantCar() {
        return this.configForm.get('wedAantCar');
    }
    get wedVijfdeCar() {
        return this.configForm.get('wedVijfdeCar');
    }
    get wedMaxBrt() {
        return this.configForm.get('wedMaxBrt');
    }
    get wedMoyBrt() {
        return this.configForm.get('wedMoyBrt');
    }
    get wedKlasse() {
        return this.configForm.get('wedKlasse');
    }
    get wedPntWinst() {
        return this.configForm.get('wedPntWinst');
    }
    get wedPntGelijk() {
        return this.configForm.get('wedPntGelijk');
    }
    get wedPntBovenMoy() {
        return this.configForm.get('wedPntBovenMoy');
    }
    get wedIdxRegels() {
        return this.configForm.get('wedIdxRegels');
    }
    get wedIdxTelling() {
        return this.configForm.get('wedIdxTelling');
    }
}
