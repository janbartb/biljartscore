import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { BaseComponent } from '../../base/base.component';
import { TeamMatch } from '../../model/match';
import { Button, ButtonGroup } from '../../model/button';
import { KnbbTeamMatchTeamComponent } from './knbb-team-match-team/knbb-team-match-team.component';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { ModalMessage } from '../../model/modal-message';

@Component({
    selector: 'app-knbb-team-match',
    standalone: true,
    imports: [
        PageHeaderComponent,
        KnbbTeamMatchTeamComponent,
        ButtonComponent
    ],
    templateUrl: './knbb-team-match.component.html',
    styleUrl: './knbb-team-match.component.css'
})
export class KnbbTeamMatchComponent extends BaseComponent implements OnInit {
    subtitle: string = 'Eindresultaat';
    matchRead: boolean = false;
    match: TeamMatch = new TeamMatch();
    wedStatus: number[] = [0, 0, 0, 0];
    voortgang: string[] = ['0%', '0%', '0%', '0%'];
    buttonGroup: ButtonGroup = new ButtonGroup();
    modals: ModalMessage[] = [];
    modalVisible: boolean = false;

    override escapePressed(): void {
        this.router.navigate(['/teammatch/setup/check']);
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
        let pressedButtons = [idx];
        if (idx < 3) {
            pressedButtons.push(3);
        }
        pressedButtons.forEach(i => {
            this.buttonGroup.buttons[i].selected = true;
        });
        setTimeout(() => {
            pressedButtons.forEach(i => {
                this.buttonGroup.buttons[i].selected = false;
            });
            this.buttonClicked(idx);
        }, 300);
    }

    buttonClicked(idx: number) {
        if (idx < 3) {
            this.wedstrijdClicked(idx);
        }
        else if (idx == 3) {
            this.wedstrijdClicked(-1);
        }
        else {
            this.nieuwClicked();
        }
    }

    wedstrijdClicked(idx: number): void {
        let index = idx;
        if (index === -1) {
            if (this.wedStatus[0] < 2) {
                index = 0;
            }
            else if (this.wedStatus[1] < 2) {
                index = 1;
            }
            else if (this.wedStatus[2] < 2) {
                index = 2;
            }
            else {
                index = 0;
            }
        }
        this.router.navigate(['teammatch/score/' + (index + 1)]);
    }

    nieuwClicked(): void {
        this.router.navigate(['teammatch/setup/thuis']);
    }

    fillMatchAndWedStatus(): void {
        let wedStatusTotaal = 0;
        [0 ,1, 2].forEach(idxWed => {
            const spl = this.match.teams[0].spelers[idxWed];
            this.wedStatus[idxWed] = 0;
            if (spl.stand.aantBrt > 0) {
                this.wedStatus[idxWed] = 1;
            }
            if (this.match.gameOver[idxWed]) {
                this.wedStatus[idxWed] = 2;
            }
            wedStatusTotaal += this.wedStatus[idxWed];
        });
        this.wedStatus[3] = 0;
        if (wedStatusTotaal > 0) {
            this.wedStatus[3] = wedStatusTotaal === 6 ? 2 : 1;
        }
    }

    fillMatchAndWedVoortgang(): void {
        const maxBrt = this.match.maxBeurten;
        let vg = [0, 0, 0];
        [0 ,1, 2].forEach(idxWed => {
            const spl = this.match.teams[0].spelers[idxWed];
            const teg = this.match.teams[1].spelers[idxWed];
            if (this.wedStatus[idxWed] == 0) {
                vg[idxWed] = 0;
            }
            else if (this.wedStatus[idxWed] == 2) {
                vg[idxWed] = 100;
            }
            else {
                vg[idxWed] = Math.max(spl.stand.aantCar / spl.splTsCar, teg.stand.aantCar / teg.splTsCar, (spl.stand.aantBrt + teg.stand.aantBrt) / (2 * maxBrt)) * 100;
            }
            this.voortgang[idxWed] = vg[idxWed] + '%';
        });
        this.voortgang[3] = ((vg[0] + vg[1] + vg[2]) / 3) + '%';
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            this.buttonPressed(3);
            return false;
        }
        if (event.key === 'Escape' || event.key === 'Backspace') {
            this.escapePressed();
            return false;
        }
        if (event.code === 'Digit1' || event.code === 'Numpad1') {
            this.buttonPressed(0);
            return false;
        }
        if (event.code === 'Digit2' || event.code === 'Numpad2') {
            this.buttonPressed(1);
            return false;
        }
        if (event.code === 'Digit3' || event.code === 'Numpad3') {
            this.buttonPressed(2);
            return false;
        }
        if (event.code === 'KeyN') {
            this.buttonPressed(4);
            return false;
        }
        if (event.code === 'KeyL' || event.key === '*') {
            //this.appStat.escapeLijstUrl = '/match';
            this.router.navigate(['teammatch/score/lijst']);
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        this.bssApi.getKnbbTeamMatch()
        .then(resp => {
            if (resp.gevonden) {
                this.match = resp.match;
            }
            if (this.match.teams.length < 2) {
                this.router.navigate(['teammatch/setup/thuis']);
                return;
            }
            if (!(this.match.teams.every(tm => tm.spelers.length === 3))) {
                this.router.navigate(['teammatch/setup/thuis']);
                return;
            }

            this.fillMatchAndWedStatus();
            this.fillMatchAndWedVoortgang();
            if (this.wedStatus[3] === 2) {
                const modalMsg = new ModalMessage('success', ['▪ ▪ ▪ ▪ EINDE MATCH ▪ ▪ ▪ ▪'], '', 3);
                this.modals.push(modalMsg);
                this.showModal();
            }
            else {
                this.subtitle = 'Tussenresultaat';
            }
            this.matchRead = true;
            this.buttonGroup.addButton(new Button('1', 'Wedstrijd 1', true, true));
            this.buttonGroup.addButton(new Button('2', 'Wedstrijd 2', true, true));
            this.buttonGroup.addButton(new Button('3', 'Wedstrijd 3', true, true));
            this.buttonGroup.addButton(new Button('W', 'Naar wedstrijd'));
            this.buttonGroup.addButton(new Button('N', 'Nieuwe match', true));
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }
}
