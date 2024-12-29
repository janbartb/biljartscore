import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { KnbbTeamMatchTeamComponent } from '../knbb-team-match/knbb-team-match-team/knbb-team-match-team.component';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { BaseComponent } from '../../base/base.component';
import { Match } from '../../model/match';
import { Button, ButtonGroup } from '../../model/button';
import { ModalMessage } from '../../model/modal-message';
import { KnbbMatchSpelerComponent } from './knbb-match-speler/knbb-match-speler.component';

@Component({
    selector: 'app-knbb-match',
    standalone: true,
    imports: [
        PageHeaderComponent,
        KnbbMatchSpelerComponent,
        ButtonComponent
    ],
    templateUrl: './knbb-match.component.html',
    styleUrl: './knbb-match.component.css'
})
export class KnbbMatchComponent extends BaseComponent implements OnInit {
    subtitle: string = 'Eindresultaat';
    matchRead: boolean = false;
    match: Match = new Match();
    wedStatus: number = 0;
    voortgang: string = '0%';
    buttonGroup: ButtonGroup = new ButtonGroup();
    modals: ModalMessage[] = [];
    modalVisible: boolean = false;

    override escapePressed(): void {
        this.router.navigate(['/match/setup/check']);
    }

    private showModal(): void {
        if (!this.modalVisible) {
            this.modalVisible = true;
            setTimeout(() => {this.hideModal()}, this.modals[0].duration);
        }
    }

    hideModal(): void {
        if (this.modalVisible) {
            this.modalVisible = false;
            this.modals.shift();
            if (this.modals.length) {
                this.showModal();
            }
        }
    }

    buttonPressed(idx: number) {
        this.buttonGroup.buttons[idx].selected = true;
        setTimeout(() => {
            this.buttonGroup.buttons[idx].selected = false;
            this.buttonClicked(idx);
        }, 300);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.wedstrijdClicked();
        }
        else {
            this.nieuwClicked();
        }
    }

    wedstrijdClicked(): void {
        this.router.navigate(['match/score']);
    }

    nieuwClicked(): void {
        this.router.navigate(['match/setup/comp']);
    }

    fillMatchAndWedStatus(): void {
        const spl = this.match.spelers[0];
        this.wedStatus = 0;
        if (spl.stand.aantBrt > 0) {
            this.wedStatus = 1;
        }
        if (this.match.matchOver) {
            this.wedStatus = 2;
        }
    }

    fillMatchAndWedVoortgang(): void {
        const maxBrt = this.match.maxBeurten;
        let vg = 0;
        const spl = this.match.spelers[0];
        const teg = this.match.spelers[1];
        if (this.wedStatus == 0) {
            vg = 0;
        }
        else if (this.wedStatus == 2) {
            vg = 100;
        }
        else {
            vg = Math.max(spl.stand.aantCar / spl.splTsCar, teg.stand.aantCar / teg.splTsCar, (spl.stand.aantBrt + teg.stand.aantBrt) / (2 * maxBrt)) * 100;
        }
        this.voortgang = vg + '%';
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(0);
            return false;
        }
        if (event.key === 'Escape' || event.key === 'Backspace') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'KeyN') {
            this.buttonPressed(1);
            return false;
        }
        if (event.code === 'KeyL' || event.key === '*') {
            this.appData.gotoPage(this.router.url, 'match/lijst');
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.bssApi.getKnbbMatch()
        .then(resp => {
            if (resp.gevonden) {
                this.match = resp.match;
            }
            else {
                this.alert.showError('ERROR match resultaat : bestand match.json niet gevonden.');
                this.nieuwClicked();
                return;
            }
            if (this.match.spelers.length < 2) {
                this.router.navigate(['match/setup/spelers']);
                return;
            }
            if (!(this.match.spelers.every(sp => sp.splId != ''))) {
                this.router.navigate(['match/setup/spelers']);
                return;
            }
            if (this.match.spelers[0].splTsCar == 0) {
                this.router.navigate(['match/setup/check']);
                return;
            }

            this.fillMatchAndWedStatus();
            this.fillMatchAndWedVoortgang();
            if (this.match.matchOver) {
                const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE MATCH ▪ ▪ ▪ ▪'], '', 3);
                this.modals.push(modalMsg);
                this.showModal();
            }
            else {
                this.subtitle = 'Tussenresultaat';
            }
            this.matchRead = true;
            this.buttonGroup.addButton(new Button('Enter', 'Naar scorebord', true));
            this.buttonGroup.addButton(new Button('N', 'Nieuwe match', true));
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }
}
