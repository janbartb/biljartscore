import { Component, HostListener, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { List } from '../../model/list';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { KnbbCompetitie } from '../../model/knbb-competitie';
import { Alinea, ConfirmDialog } from '../../model/confirm-dialog';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { ButtonComponent } from '../../shared/button-group/button/button.component';
import { Button } from '../../model/button';

@Component({
    selector: 'app-knbb-competities',
    standalone: true,
    imports: [
        PageHeaderComponent,
        ConfirmComponent,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './knbb-competities.component.html',
    styleUrl: './knbb-competities.component.css'
})
export class KnbbCompetitiesComponent extends BaseComponent implements OnInit {
    subtitle: string = 'KNBB competities';
    sectionTitle: string = 'Competities';
    compLijst: List<KnbbCompetitie> = new List<KnbbCompetitie>();
    idxToDelete: number = -1;
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    enterButton: Button = new Button('Enter', 'Wijzigen', true);
    toevoegButton: Button = new Button('+', 'Toevoegen', true);
    verwijderButton: Button = new Button('Del', 'Verwijderen', true);

    buttonPressed(button: Button) {
        if (button.disabled) {
            return;
        }
        button.selected = true;
        setTimeout(() => {
            button.selected = false;
            if (button.key == 'Enter') {
                this.wijzigenClicked(this.compLijst.selectedIdx);
            }
            else if (button.key == 'Ins') {
                this.toevoegenClicked();
            }
            else if (button.key == 'Del') {
                this.verwijderenClicked(this.compLijst.selectedIdx);
            }
        }, 300);
    }

    override escapePressed(): void {
        if (this.compLijst.selectedIdx >= 0) {
            this.compLijst.clearSelection();
            return;
        }
        super.escapePressed();
    }

    competitieClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.compLijst.selectItem(idx);
    }

    wijzigenClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        this.appData.gotoPage(this.router.url, this.router.url + `/${this.compLijst.getSelectedItem()?.competitieId}`);
    }

    toevoegenClicked() {
        this.appData.gotoPage(this.router.url, this.router.url + '/toevoegen');
    }

    verwijderenClicked(idx: number, event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }
        if (idx < 0) {
            return;
        }
        this.idxToDelete = idx;
        this.confirmVerwijderen(this.idxToDelete);
    }

    private confirmVerwijderen(idx: number) {
        const toDelete = this.compLijst.filtered[idx];
        let inhoud: Alinea[] = [];
        inhoud.push(new Alinea([`Competitie '${toDelete.naam}' verwijderen.`]));
        inhoud.push(new Alinea([`Weet u het zeker?`]));
        this.confirmDialog = new ConfirmDialog('verwijderen', inhoud);
        this.isDialogOpen = true;
    }

    confirmReplied(confirmed: boolean) {
        console.log('confirmed : ' + confirmed);
        if (confirmed) {
            const comp = this.compLijst.filtered[this.idxToDelete];
            this.bssApi.deleteKnbbCompetitie(comp)
            .then(resp => {
                this.alert.showAlert(resp.message, 'success');
                this.getKnbbCompetities();
            })
            .catch(err => {
                this.alert.showError(err);
            });
        }
        this.isDialogOpen = false;
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        if (this.isDialogOpen) {
            return false;
        }
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.compLijst.selectPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.compLijst.selectNextItem();
            }
            return false;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(this.enterButton);
            return false;
        }
        if (event.key === 'Insert') {
            this.buttonPressed(this.toevoegButton);
            return false;
        }
        if (event.key === 'Delete') {
            this.buttonPressed(this.verwijderButton);
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
        this.getKnbbCompetities();
    }

    private getKnbbCompetities() {
        this.bssApi.getKnbbCompetities(this.appData.getSeizoen(), this.appData.getDistrict().disId, this.spelId)
        .then(result => {
            result.sort(this.compareCompetities);
            this.compLijst.fillItems(result);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private compareCompetities(a: KnbbCompetitie, b: KnbbCompetitie): number {
        if (a.klasse == b.klasse) {
            if (a.volgNr == b.volgNr) {
                if (a.poule == b.poule) {
                    return (a.naam < b.naam) ? 1 : -1;
                }
                return a.poule - b.poule;
            }
            return a.volgNr - b.volgNr;
        }
        return (a.klasse > b.klasse) ? 1 : -1;
    }
}
