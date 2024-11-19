import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '../../../base/base.component';
import { Team, Vereniging } from '../../../model/vereniging';
import { List } from '../../../model/list';
import { SpelerWrapper } from '../../../model/speler';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { ButtonComponent } from '../../../shared/button-group/button/button.component';
import { NgClass } from '@angular/common';
import { Button } from '../../../model/button';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from "../../../shared/section-footer-btns/section-footer-btns.component";

@Component({
    selector: 'app-vereniging',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass,
        FormsModule,
        ReactiveFormsModule
    ],
    templateUrl: './vereniging.component.html',
    styleUrl: './vereniging.component.css'
})
export class VerenigingComponent extends BaseComponent implements OnInit {
    route = inject(ActivatedRoute);

    subtitle: string = "Vereniging"
    sections: string[] = ['Vereniging', 'Teams', 'Leden'];
    vereniging: Vereniging = new Vereniging();
    teamLijst: List<Team> = new List<Team>();
    ledenLijst: List<SpelerWrapper> = new List<SpelerWrapper>();

    wijzigButtons: Button[] = [new Button('W', 'Wijzigen', true)];
    ledenButtons: Button[] = [new Button('L', 'Wijzigen', true)];
    teamButtons = [
        new Button('+', 'Team', true), 
        new Button('Del', 'Team', true)
    ];

    enterPressed() {
        this.teamClicked(this.teamLijst.selectedIdx);
    }

    buttonPressed(event: any, button: Button) {
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'W') {
                this.verenigingWijzigenClicked();
            }
            else if (button.key == '+') {
                this.teamToevoegenClicked();
            }
            else if (button.key == 'L') {
                this.ledenWijzigenClicked();
            }
            else if (button.key == 'Del') {
                this.teamVerwijderenClicked(event, this.teamLijst.selectedIdx);
            }
        }, 300);
    }

    teamButtonClicked(idx: number) {
        if (idx == 0) {
            this.teamToevoegenClicked();
        }
        else if (idx == 1) {
            this.teamVerwijderenClicked(undefined, this.teamLijst.selectedIdx);
        }
    }

    verenigingWijzigenClicked() {
        this.appData.gotoPage(this.router.url, this.router.url + '/edit');
    }

    teamClicked(idx: number) {
        if (this.teamLijst.isIndexWithinRange(idx)) {
            const team = this.teamLijst.filtered[idx];
            this.appData.gotoPage(this.router.url, this.router.url + '/team/' + team.teamId);
            return;
        }
        this.alert.showError(`Team index ${idx} valt buiten de range in de team lijst.`);
    }

    teamToevoegenClicked() {
        this.appData.gotoPage(this.router.url, this.router.url + '/team/toevoegen');
    }

    teamVerwijderenClicked(event: any, idx: number) {
        event?.stopPropagation();
        if (this.teamLijst.isIndexWithinRange(idx)) {
            //TODO: first confirm and save if confirmed
            const teamToRemove = this.teamLijst.filtered[idx];
            this.teamLijst.items = this.teamLijst.items.filter(team => team.teamId != teamToRemove.teamId);
            this.teamLijst.filtered.splice(idx, 1);
            this.teamLijst.clearSelection();
            this.vereniging.teams = this.teamLijst.items;
            this.bssApi.updateVereniging(this.vereniging)
                .then(resp => {
                    this.alert.showAlert(`Team '${teamToRemove.naam}' is verwijderd.`, 'success');
                })
                .catch(err => {
                    this.alert.showError(err);
                });
        }
    }

    ledenWijzigenClicked() {
        this.alert.showAlert('Deze functie is nog onder constructie', 'info', 2);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.teamLijst.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.teamLijst.selectNextItem();
            }
            return false;
        }
        if (event.key === 'Enter') {
            this.enterPressed();
            return false;
        }
        if (event.key === 'Escape') {
            this.escapePressed();
            return false;
        }
        if (event.key === '+' || event.key === '=') {
            this.buttonPressed(event, this.teamButtons[0]);
            return false;
        }
        if (event.code === 'KeyW') {
            this.buttonPressed(event, this.wijzigButtons[0]);
            return false;
        }
        if (event.key === 'Delete') {
            this.buttonPressed(event, this.teamButtons[1]);
            return false;
        }
        if (event.code === 'KeyL') {
            this.buttonPressed(event, this.ledenButtons[0]);
            return false;
        }
        if (event.key === 'Home') {
            this.homePressed();
            return false;
        }
        return true;
    }

    ngOnInit(): void {
        const id: string | null = this.route.snapshot.paramMap.get('verId');
        if (!id) {
            this.alert.showAlert('Het ID in de URL is undefined.', 'error');
            return;
        }
        Promise.all([
            this.bssApi.getVereniging(id),
            this.bssApi.getLedenVanVereniging(id, this.spelId)
        ])
            .then(results => {
                this.vereniging = results[0];
                let teams = this.vereniging.teams.filter(team => team.spelsoort == this.spelId);
                this.teamLijst.fillItems(teams);
                this.sortTeams();
                this.ledenLijst.fillItems(results[1]);
                this.sortLeden();
                this.subtitle = `Vereniging '${this.vereniging.naam}'`;
            })
            .catch((err) => {
                this.alert.showAlert(err, 'error');
            });
    }

    private sortTeams() {
        this.teamLijst.filtered.sort((a: Team, b: Team) => {
            if (a.klasse == b.klasse) {
                return (a.teamId > b.teamId) ? 1 : -1;
            }
            else {
                return (a.klasse > b.klasse) ? 1 : -1;
            }
        });
    }

    private sortLeden() {
        this.ledenLijst.filtered.sort((a: SpelerWrapper, b: SpelerWrapper) => {
            if (a.getNaam() == b.getNaam()) {
                return 0;
            }
            else {
                return (a.getNaam() > b.getNaam()) ? 1 : -1;
            }
        });
    }

}
