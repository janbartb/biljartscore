import { Component, effect, ElementRef, HostListener, inject, OnInit, viewChild } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { KnbbCompetitie, KnbbCompTeam } from '../../../model/knbb-competitie';
import { ActivatedRoute } from '@angular/router';
import { List } from '../../../model/list';
import { Button } from '../../../model/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { notEmpty } from '../../../directives/validators.directive';
import { SectionHeaderComponent } from '../../../shared/section-header/section-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { Team, Vereniging } from '../../../model/vereniging';
import { HelperService } from '../../../services/helper.service';

@Component({
    selector: 'app-knbb-competitie-edit',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionHeaderComponent,
        SectionFooterBtnsComponent,
        ReactiveFormsModule,
        NgClass
    ],
    templateUrl: './knbb-competitie-edit.component.html',
    styleUrl: './knbb-competitie-edit.component.css'
})
export class KnbbCompetitieEditComponent extends BaseComponent implements OnInit {
    helper = inject(HelperService);
    route = inject(ActivatedRoute);
    fb = inject(FormBuilder);

    competitie: KnbbCompetitie = new KnbbCompetitie();
    teamLijst: List<Team> = new List<Team>();
    subtitle: string = '';
    subtitle2: string = '';
    activeSection: number = 0;
    dataChanged: boolean = false;

    teamButtons: Button[] = [new Button('T', 'Teams wijzigen', true)];
    compButtons: Button[] = [new Button('Enter', 'Opslaan', true)];

    compDataForm!: FormGroup;

    htmlInputNaam = viewChild<ElementRef<HTMLInputElement>>("compnaam");
    htmlInputBeurten = viewChild<ElementRef<HTMLInputElement>>("compbeurten");

    constructor() {
        super();
        effect(() => {
            this.htmlInputBeurten()?.nativeElement.focus();
            this.htmlInputNaam()?.nativeElement.focus();
        });
    }

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'T') {
                if (this.activeSection == 1) {
                    this.teamButtonClicked();
                }
            }
            if (button.key == 'Enter') {
                if (this.activeSection == 0) {
                    this.compButtonClicked();
                }
            }
        }, 300);
    }

    override escapePressed(): void {
        if (this.dataChanged || this.teamLijst.selectedIdx >= 0) {
            this.compDataForm.reset();
            this.dataChanged = false;
            this.teamLijst.clearSelection();
            return;
        }
        super.escapePressed();
    }

    compButtonClicked() {
        if (!this.dataChanged) {
            return;
        }
        this.competitie.naam = this.naam?.value;
        this.competitie.maxBeurten = this.maxBeurten?.value;
        //console.log(this.competitie);
        this.bssApi.updateKnbbCompetitie(this.competitie)
        .then(resp => {
            this.alert.showAlert(resp.message, 'success');
            this.getData(this.competitie.competitieId);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    enterTeamClicked() {

    }

    teamButtonClicked() {
        this.appData.gotoPage(this.router.url, this.router.url + '/teams');
    }

    teamClicked(idx: number) {
        this.activeSection = 1;
        this.teamLijst.selectItem(idx);
        //this.setActionForSelectedTeam();
    }

    toevoegenClicked() {
        // let teamToAdd: KnbbCompTeam = new KnbbCompTeam();
        // const team = this.teamLijst.getSelectedItem();
        // if (team) {
        //     teamToAdd.team = team;
        //     this.compTeams.push(teamToAdd);
        //     this.compTeams.sort(this.compareCompTeams);
        //     this.compTeamsEdit = JSON.stringify(this.compTeams);
        //     this.setActionForSelectedTeam();
        // }
    }

    verwijderenClicked() {
        // const teamToRemove = this.teamLijst.getSelectedItem();
        // if (teamToRemove) {
        //     const idx = this.compTeams.findIndex(cteam => cteam.team.verId == teamToRemove.verId && cteam.team.teamId == teamToRemove.teamId);
        //     if (idx >= 0) {
        //         this.compTeams.splice(idx, 1);
        //         this.compTeamsEdit = JSON.stringify(this.compTeams);
        //         this.setActionForSelectedTeam();
        //     }
        // }
    }

    toggleSection(): void {
        this.activeSection = (this.activeSection == 0) ? 1 : 0;
        if (this.activeSection == 0) {
            this.htmlInputNaam()?.nativeElement.focus();
        }
        else {
            this.htmlInputNaam()?.nativeElement.blur();
            this.htmlInputBeurten()?.nativeElement.blur();
        }
    }

    setDataChanged(): void {
        this.dataChanged = !(this.competitie.naam == this.naam?.value && this.competitie.maxBeurten == this.maxBeurten?.value)
    }

    @HostListener('document:keydown', ['$event'])
    handleKeydownEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log('down = ' + event.code + ' : ' + event.key);
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (!fromInput || event.ctrlKey) {
                event.preventDefault();
                return false;
            }
        }
        return true;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyupEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log('up = ' + event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (this.activeSection == 1) {
                if (event.key === 'ArrowUp') {
                    this.teamLijst.selectPreviousItem();
                }
                if (event.key === 'ArrowDown') {
                    this.teamLijst.selectNextItem();
                }
                return false;    
            }
            return true;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (!fromInput || event.ctrlKey) {
                this.toggleSection();
            }
            return false;
        }
        if (event.key === 'Enter' && this.activeSection == 0) {
            this.buttonPressed(this.compButtons[0]);
            return false;
        }
        if (event.code === 'KeyT' && this.activeSection == 1) {
            this.buttonPressed(this.teamButtons[0]);
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
        this.subtitle = 'KNBB competities ' + this.appData.getSeizoen();
        const compId: string | null = this.route.snapshot.paramMap.get('compId');
        if (!compId) {
            this.alert.showAlert('Het competitie ID in de URL is undefined.', 'error');
            return;
        }
        this.getData(compId);
    }

    private getData(id: string) {
        Promise.all([
            this.bssApi.getKnbbCompetitie(this.appData.getSeizoen(), this.appData.getDistrict().disId, this.spelId, id),
            this.bssApi.getVerenigingen()
        ])
        .then(results => {
            this.competitie = results[0];
            let teams = this.helper.getCompetitieTeamsData(this.competitie, results[1]);
            teams.sort(this.compareTeams);
            this.teamLijst.fillItems(teams);
            this.subtitle2 = `Competitie '${this.competitie.competitieId} ${this.competitie.naam}'`;
            this.createForm();
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private createForm() {
        this.compDataForm = this.fb.nonNullable.group({
            naam: [this.competitie.naam, [Validators.required, notEmpty()]],
            maxBeurten: [this.competitie.maxBeurten, [Validators.required, Validators.min(1)]]
        });
    }

    private compareTeams(a: Team, b: Team) {
        return (a.naam > b.naam) ? 1 : -1;
    }

    get naam() {
        return this.compDataForm.get('naam');
    }
    get maxBeurten() {
        return this.compDataForm.get('maxBeurten');
    }
}
