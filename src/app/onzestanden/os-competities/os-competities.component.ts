import { Component, HostListener, OnInit } from '@angular/core';
import { BaseComponent } from '../../base/base.component';
import { District } from '../../model/district';
import { BpCompetitie } from '../../model/bpoint';
import { KnbbCompetitie } from '../../model/knbb-competitie';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { HelpComponent } from '../../shared/help/help.component';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-os-competities',
    standalone: true,
    imports: [
        PageHeaderComponent,
        HelpComponent,
        FormsModule
    ],
    templateUrl: './os-competities.component.html',
    styleUrl: './os-competities.component.css'
})
export class OsCompetitiesComponent extends BaseComponent implements OnInit {
    districten: District[] = [];
    district: District = new District();
    bpCompetities: BpCompetitie[] = [];
    bssCompetities: KnbbCompetitie[] = [];
    status: string = 'loading';

    competitieClicked(idx: number) {
        const clickedComp = this.bpCompetities[idx];
        console.log(`Competitie '${clickedComp.naam}' clicked`);
        localStorage.setItem('bpComp', JSON.stringify(clickedComp));
        this.router.navigate(['onzestanden/competitie']);
    }

    getCompetitiesFromOnzestanden() {
        if (this.district && this.district.knbbId != '') {
            if (this.district.knbbId == '86') {
                Promise.all([
                    this.bssApi.getCompsFromOnzestanden(),
                    this.bssApi.getKnbbCompetities(this.district.disId, this.spelId)
                ])
                .then(results => {
                    this.bssCompetities = results[1];
                    if (results[0].length == 0) {
                        this.alert.showAlert('Geen competities gevonden voor dit district.', 'warning', 6);
                    }
                    else {
                        console.log(results[0]);
                        results[0].forEach(entry => {
                            this.bpCompetities.push(this.processResultEntry(entry));
                        });
                        this.status = 'success';
                        console.log(this.bpCompetities);    
                    }
                })
                .catch(err => {
                    this.status = 'error';
                    this.alert.showError(err);
                });    
            }
            else {
                this.alert.showAlert('Deze functionaliteit werkt alleen voor district Kempenland!', 'warning', 6);
            }
        }
        else {
            this.alert.showAlert('Geen KNBB ID voor gekozen district!', 'warning', 6);
        }
    }

    @HostListener('document:keyup', ['$event'])
        handleKeyboardEvent(event: KeyboardEvent): boolean {
        const fromInput = event.target instanceof HTMLInputElement;
        console.log(event.code + ' : ' + event.key);
        if (this.alert.helpVisible) {
            this.alert.hideHelp();
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
        localStorage.removeItem('bpComp');
        this.getDistricten();
    }

    private processResultEntry(entry: BpCompetitie): BpCompetitie {
        let comp = new BpCompetitie();
        comp.district = this.district;
        comp.klasse = entry.klasse;
        comp.seizoen = entry.seizoen;
        comp.spelsoortId = this.spelId;
        comp.naam = entry.naam;
        comp.volgNr = entry.volgNr;
        comp.bpUrl = entry.bpUrl;
        comp.poule = '1';
        const queries = entry.bpUrl.split('&');
        let queryParts = queries[0].split('=');
        comp.osKlasse = queryParts[1];
        queryParts = queries[1].split('=');
        comp.osOrg = queryParts[1];
        queryParts = queries[2].split('=');
        comp.osComp = queryParts[1];
        comp.knbbId = comp.osComp;
        comp.bssId = comp.klasse + '-' + comp.volgNr + '-' + comp.poule;
        comp.inBss = this.bssCompetities.some(bssComp => bssComp.competitieId == comp.bssId);
        return comp;
    }

    private getDistricten() {
        this.bssApi.getKnbbDistricten()
            .then(result => {
                result.sort(this.compareDistricten);
                this.districten = result;
                const foundDistrict = this.districten.find(dis => dis.disId == this.appData.getDistrict().disId);
                if (foundDistrict) {
                    this.district = foundDistrict;
                    this.getCompetitiesFromOnzestanden();
                }
            })
            .catch(err => {
                this.alert.showError(err);
            });
    }

    private compareDistricten(a: District, b: District): number {
        if (a.disNaam == b.disNaam) {
            return a.disId < b.disId ? -1 : 1;
        }
        return a.disNaam < b.disNaam ? -1 : 1;
    }
}
