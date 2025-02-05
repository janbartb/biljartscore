import { Component, HostListener, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { List } from '../../model/list';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { KnbbCompetitie } from '../../model/knbb-competitie';
import { Alinea, ConfirmDialog } from '../../model/dialogs';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { Button } from '../../model/button';
import { SectionFooterBtnsComponent } from '../../shared/section-footer-btns/section-footer-btns.component';

@Component({
    selector: 'app-knbb-competities',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        ConfirmComponent,
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
    escapeCount: number = 0;
    confirmDialog: ConfirmDialog = new ConfirmDialog('', []);

    buttons: Button[] = [
        new Button('Enter', 'Wijzigen', true),
        new Button('+', 'Toevoegen', true),
        new Button('Del', 'Verwijderen', true)
    ];

    buttonPressed(idx: number) {
        this.buttons[idx].selected = true;
        setTimeout(() => {
            this.buttons[idx].selected = false;
            this.buttonClicked(idx);
        }, 300);
    }

    override escapePressed(): void {
        if (this.compLijst.hoveredIdx >= 0) {
            this.compLijst.clearSelection();
            this.escapeCount--;
            return;
        }
        super.escapePressed();
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.wijzigenClicked();
        }
        else if (idx == 1) {
            this.toevoegenClicked();
        }
        else if (idx == 2) {
            this.verwijderenClicked(this.compLijst.hoveredIdx);
        }
    }

    competitieClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        const compId = this.compLijst.filtered[idx].competitieId;
        this.appData.gotoPage(this.router.url, this.router.url + `/${compId}`);
    }

    wijzigenClicked() {
        this.competitieClicked(this.compLijst.hoveredIdx);
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
                this.compLijst.hoverPreviousItem();
            }
            if (event.key === 'ArrowDown') {
                this.compLijst.hoverNextItem();
            }
            if (this.escapeCount == 0) {
                this.escapeCount++;
            }
            return false;
        }
        if (event.key === 'Enter') {
            this.buttonPressed(0);
            return false;
        }
        if (event.key === '+' || event.code === 'Equal') {
            this.buttonPressed(1);
            return false;
        }
        if (event.key === 'Delete') {
            this.buttonPressed(2);
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
        console.log(this.appData.getConfig());
        console.log(this.appData.getDistrict());
        console.log(this.spelId);
        this.bssApi.getKnbbCompetities(this.appData.getDistrict().disId, this.spelId)
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
