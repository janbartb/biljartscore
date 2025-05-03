import { Component, HostListener, OnInit } from '@angular/core';
import { Match } from '../../../model/match';
import { KnbbCompetitie } from '../../../model/knbb-competitie';
import { List } from '../../../model/list';
import { Button } from '../../../model/button';
import { BaseComponent } from '../../../base/base.component';
import { PageHeaderComponent } from '../../../shared/page-header/page-header.component';
import { SectionFooterBtnsComponent } from '../../../shared/section-footer-btns/section-footer-btns.component';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-knbb-match-comp',
    standalone: true,
    imports: [
        PageHeaderComponent,
        SectionFooterBtnsComponent,
        NgClass
    ],
    templateUrl: './knbb-match-comp.component.html',
    styleUrl: './knbb-match-comp.component.css'
})
export class KnbbMatchCompComponent extends BaseComponent implements OnInit {
    subtitle: string = 'Selectie competitie';
    match: Match = new Match();
    compLijst: List<KnbbCompetitie> = new List<KnbbCompetitie>();

    buttons: Button[] = [new Button('Enter', 'Selecteer', true)]

    override escapePressed(): void {
        if (this.escapeCount > 0) {
            this.compLijst.hoveredIdx = this.compLijst.selectedIdx;
            this.setEscapeCount();
            return;
        }
        this.router.navigate(['spelkeuze']);
    }

    buttonPressed(idx: number) {
        this.buttons[idx].selected = true;
        setTimeout(() => {
            this.buttons[idx].selected = false;
            if (idx == 0) {
                this.competitieClicked(this.compLijst.hoveredIdx);
            }
        }, 300);
    }

    buttonClicked(idx: number) {
        if (idx == 0) {
            this.competitieClicked(this.compLijst.hoveredIdx);
        }
    }

    competitieClicked(idx: number) {
        if (idx < 0) {
            return;
        }
        const selectedComp = this.compLijst.filtered[idx];
        if (selectedComp.competitieId == this.match.compId) {
            this.router.navigate(['match/setup/spelers']);
            return;
        }
        this.initMatch(selectedComp);
        this.saveMatchAndContinue();
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): boolean {
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            if (event.key === 'ArrowUp') {
                this.compLijst.hoverPreviousItem();
                this.setEscapeCount();
                return false;
            }
            if (event.key === 'ArrowDown') {
                this.compLijst.hoverNextItem();
                this.setEscapeCount();
                return false;
            }
            return true;
        }
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
            this.bssApi.getKnbbCompetities(this.appData.getDistrict().disId, this.spelId),
            this.bssApi.getKnbbMatch()
        ])
            .then(results => {
                results[0].sort(this.compareCompetities);
                this.compLijst.fillItems(results[0]);
                if (results[1].gevonden) {
                    this.match = results[1].match;
                    this.preselectComp(this.match.compId);
                }
            })
            .catch(err => {
                this.alert.showError(err);
            });
    }

    private saveMatchAndContinue() {
        this.bssApi.saveKnbbMatch(this.match)
            .then(() => {
                this.router.navigate(['match/setup/spelers']);
            })
            .catch(err => {
                this.alert.showError(err);
            });
    }

    private initMatch(comp: KnbbCompetitie) {
        this.match = new Match();
        this.match.compId = comp.competitieId;
        this.match.klasse = comp.klasse;
        this.match.maxBeurten = comp.maxBeurten;
    }

    private preselectComp(id: string) {
        const idx = this.compLijst.filtered.findIndex(comp => comp.competitieId == id);
        if (idx >= 0) {
            this.compLijst.hoveredIdx = this.compLijst.selectedIdx = idx;
        }
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

    private setEscapeCount() {
        this.escapeCount = this.compLijst.hoveredIdx != this.compLijst.selectedIdx ? 1 : 0;
    }

}
