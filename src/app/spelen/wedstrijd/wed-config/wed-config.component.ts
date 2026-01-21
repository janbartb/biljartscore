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
    title: string = 'Wedstrijd spelen';
    subtitle: string = 'Oefen wedstrijd - instellingen';
    wedstrijd: Wedstrijd = new Wedstrijd();
    wedstrijdOk: boolean = false;
    regelOpties: string[] = [];
    telOpties: string[] = [];
    knbbKlassen: string[] = [];
    moyTabel: MoyenneTabel = new MoyenneTabel();

    buttons: Button[] = [
        new Button('Enter', 'Opslaan', true)
    ];

    wedstrijdForm!: FormGroup;

    buttonPressed(button: Button) {
        if (button.key == 'Enter') { 
            if (!this.wedstrijdOk) {
                return;
            }
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.buttonClicked(0);
            }
        }, 300);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.opslaanClicked();
        }
    }

    opslaanClicked() {
        this.fillWedstrijdFromFormAndSave();
    }

    regelOptieClicked(idx: number) {
        this.wedIdxRegels?.setValue(idx);
        if (idx == 0) {
            this.wedMaxBrt?.setValue(60);
        }
        else if (idx == 1) {
            this.wedMaxBrt?.setValue(0);
        }
        this.enableDisableFields();
    }

    telOptieClicked(idx: number) {
        this.wedIdxTelling?.setValue(idx);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (this.isDialogOpen) {
            return false;
        }
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
            this.knbbKlassen = results[1];
            this.createCompetitieForm();
            if (this.wedstrijd.aantSpelers == 5) {
                this.regelOpties.push('Aantal caramboles teams o.b.v. KNBB tabel driebanden klein, klasse');
                this.regelOpties.push('Vast aantal beurten voor iedere speler');
                this.regelOpties.push('Vast aantal caramboles voor ieder team');
                this.regelOpties.push('Aantal caramboles o.b.v. moyenne team en');
            }
            else {
                this.regelOpties.push('Aantal caramboles spelers o.b.v. KNBB tabel driebanden klein, klasse');
                this.regelOpties.push('Vast aantal beurten voor iedere speler');
                this.regelOpties.push('Vast aantal caramboles voor iedere speler');
                this.regelOpties.push('Aantal caramboles o.b.v. moyenne speler en');
            }

            this.telOpties.push('KNBB match telling (1 punt per 10% van te spelen caramboles)');
            this.telOpties.push('Eigen telling');
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    initWedstrijd() {
        this.wedstrijd.regels.vastAantBrt = 1;
        this.wedstrijd.regels.vastAantCar = 1;
        this.wedstrijd.regels.moyAantBrt = 1;
        const foundKlasse = this.knbbKlassen.find(klasse => klasse == 'B2');
        if (foundKlasse) {
            this.wedstrijd.regels.knbbKlasse = foundKlasse;
            this.wedstrijd.regels.maxBeurten = 60;
        }
        this.wedstrijd.telling.winstPunten = 2;
        this.wedstrijd.telling.gelijkPunten = 1;
        this.wedstrijd.telling.bovenMoyPunten = 1;
        this.wedstrijd.regels.idxOptie = 0;
        this.wedstrijd.telling.idxOptie = 0;
    }

    private enableDisableFields() {
        if (!this.wedstrijdForm) {
            return;
        }
        if (this.wedIdxRegels?.value == 0) {
            this.wedKlasse?.enable();
            this.wedAantBrt?.disable();
            this.wedAantCar?.disable();
            this.wedMoyBrt?.disable();
            }
        else if (this.wedIdxRegels?.value == 1) {
            this.wedKlasse?.disable();
            this.wedAantBrt?.enable();
            this.wedAantCar?.disable();
            this.wedMoyBrt?.disable();
            }
        else if (this.wedIdxRegels?.value == 2) {
            this.wedKlasse?.disable();
            this.wedAantBrt?.disable();
            this.wedAantCar?.enable();
            this.wedMoyBrt?.disable();
            }
        else if (this.wedIdxRegels?.value == 3) {
            this.wedKlasse?.disable();
            this.wedAantBrt?.disable();
            this.wedAantCar?.disable();
            this.wedMoyBrt?.enable();
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
                if (car > 0) {
                    team.teamTsCar = car;
                    team.teamTsBrt = 0;
                    const ratio = team.spelers[0].splTsMoy / (team.spelers[0].splTsMoy + team.spelers[1].splTsMoy);
                    team.spelers[0].splTsCar = Math.round(ratio * car);
                    team.spelers[1].splTsCar = car - team.spelers[0].splTsCar;
                    team.spelers[0].splTsBrt = team.spelers[1].splTsBrt = 0;
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

    private createCompetitieForm() {
        this.wedstrijdForm = this.fb.nonNullable.group({
            wedKlasse: [this.wedstrijd.regels.knbbKlasse],
            wedAantBrt: [this.wedstrijd.regels.vastAantBrt, [Validators.required, Validators.min(1)]],
            wedAantCar: [this.wedstrijd.regels.vastAantCar, [Validators.required, Validators.min(1)]],
            wedMaxBrt: [this.wedstrijd.regels.maxBeurten, [Validators.required, Validators.min(0)]],
            wedMoyBrt: [this.wedstrijd.regels.moyAantBrt, [Validators.required, Validators.min(1)]],
            wedPntWinst: [this.wedstrijd.telling.winstPunten, [Validators.required, Validators.min(0)]],
            wedPntGelijk: [this.wedstrijd.telling.gelijkPunten, [Validators.required, Validators.min(0)]],
            wedPntBovenMoy: [this.wedstrijd.telling.bovenMoyPunten, [Validators.required, Validators.min(0)]],
            wedIdxRegels: [this.wedstrijd.regels.idxOptie],
            wedIdxTelling: [this.wedstrijd.telling.idxOptie]
        });
        this.enableDisableFields();
    }

    get wedAantBrt() {
        return this.wedstrijdForm.get('wedAantBrt');
    }
    get wedAantCar() {
        return this.wedstrijdForm.get('wedAantCar');
    }
    get wedMaxBrt() {
        return this.wedstrijdForm.get('wedMaxBrt');
    }
    get wedMoyBrt() {
        return this.wedstrijdForm.get('wedMoyBrt');
    }
    get wedKlasse() {
        return this.wedstrijdForm.get('wedKlasse');
    }
    get wedPntWinst() {
        return this.wedstrijdForm.get('wedPntWinst');
    }
    get wedPntGelijk() {
        return this.wedstrijdForm.get('wedPntGelijk');
    }
    get wedPntBovenMoy() {
        return this.wedstrijdForm.get('wedPntBovenMoy');
    }
    get wedIdxRegels() {
        return this.wedstrijdForm.get('wedIdxRegels');
    }
    get wedIdxTelling() {
        return this.wedstrijdForm.get('wedIdxTelling');
    }
}
