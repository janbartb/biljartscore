import { Component, HostListener, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { BaseComponent } from '../../base/base.component';
import { BpDistrict } from '../../model/bpoint';
import { Button } from '../../model/button';
import { NgClass } from '@angular/common';
import { List } from '../../model/list';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-bp-districten',
    standalone: true,
    imports: [
        PageHeaderComponent,
        FormsModule,
        NgClass
    ],
    templateUrl: './bp-districten.component.html',
    styleUrl: './bp-districten.component.css'
})
export class BpDistrictenComponent extends BaseComponent implements OnInit {
    districtLijst: List<BpDistrict> = new List<BpDistrict>();
    naamFilter: string = '';
    dataReady: boolean = false;

    buttons: Button[] = [
        new Button('', 'Ophalen districten', false)
    ];

    override escapePressed(): void {
        if (this.naamFilter.length) {
            this.naamFilter = '';
            this.naamFilterChanged();
            this.setEscapeCount();
            return;
        }
        super.escapePressed();
    }

    districtClicked(idx: number) {
        let distr = this.districtLijst.filtered[idx];
        localStorage.setItem('distr', JSON.stringify(distr));
        this.appData.gotoPage('bpoint/districten', 'bpoint/district');
    }

    naamFilterChanged(event?: KeyboardEvent) {
        if (event && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === 'Escape')) {
            return;
        }
        localStorage.setItem('spelersNaamFilter', this.naamFilter);
        this.filtersChanged();
        //this.sortSpelers();
        //this.initListScrolling(this.scrollElm);
        this.setEscapeCount();
    }

    filtersChanged() {
        if (!this.naamFilter.length) {
            this.districtLijst.filter((item: BpDistrict) => { return true; });
            return;
        }
        if (this.naamFilter.length) {
            this.districtLijst.filter((item: BpDistrict) => {
                return item.naam.toLowerCase().indexOf(this.naamFilter.toLowerCase()) >= 0;
            });
        }
    }

    @HostListener('document:keyup', ['$event'])
        handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (event.key === 'Enter') {
            if (this.isDialogOpen) {
                return true;
            }
            //this.buttonPressed(this.enterButtons[0]);
            return false;
        }
        if (event.key === 'Escape') {
            if (this.isDialogOpen) {
                return true;
            }
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
            this.bssApi.getDistrictenFromBiljartpoint('86'),
            this.bssApi.getKnbbDistricten()
        ])
        .then(results => {
            let bpDistricten = results[0];
            let bssDistricten = results[1];
            bssDistricten.forEach(distr => {
                if (distr.knbbId != '') {
                    let foundDistr = bpDistricten.find(d => d.knbbId == distr.knbbId);
                    if (foundDistr) {
                        foundDistr.bssId = distr.disId;
                        if (foundDistr.bssId == this.appData.getDistrict().disId) {
                            foundDistr.isDefault = true;
                        }
                    }
                }
            });
            bpDistricten.sort(this.compareDistricten);
            this.districtLijst.fillItems(bpDistricten);
        })
        .catch(err => {
            this.alert.showError(err);
        });
    }

    private compareDistricten(a: BpDistrict, b: BpDistrict): number {
        if (a.isDefault) {
            return -1;
        }
        if (b.isDefault) {
            return 1;
        }
        if (a.bssId && !b.bssId) {
            return -1;
        }
        if (b.bssId && !a.bssId) {
            return 1;
        }
        return (a.naam < b.naam) ? -1 : 1;
    }

    private setEscapeCount() {
        this.escapeCount = this.naamFilter == '' ? 0 : 1;
    }

}
