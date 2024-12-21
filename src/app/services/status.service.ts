import { inject, Injectable } from '@angular/core';
import { Spelsoort } from '../model/spelsoort';
import { Config } from '../model/config';
import { Router } from '@angular/router';
import { AlertService } from './alert.service';
import { District } from '../model/district';

@Injectable({
    providedIn: 'root'
})
export class StatusService {
    router = inject(Router);
    alert = inject(AlertService);

    private urlHistory: string[] | undefined = undefined;

    constructor() {}

    // CONFIG

    isAllowed(allow?: boolean): boolean {
        if (allow) {
            return true;
        }
        if (localStorage.getItem('notifications') != null) {
            return false;
        }
        return true;
    }

    setConfig(config: Config) {
        localStorage.setItem('config', JSON.stringify(config));
    }

    getConfig(): Config | undefined {
        const conf = localStorage.getItem('config');
        if (!conf) {
            // this.alert.showError('Instellingen niet gevonden in localStorage! Driebanden gekozen.');
            // this.router.navigate(['home']);
            return undefined;
        }
        return JSON.parse(conf);
    }

    getSeizoen(): string {
        const conf = this.getConfig();
        return conf ? conf.seizoen : this.getHuidigSeizoen();
    }

    getDistrict(): District {
        const conf = this.getConfig();
        return conf ? conf.district : { disId: 'kemp', knbbId: '86', disNaam: 'Kempenland'};
    }

    getKlasse(): string {
        const conf = this.getConfig();
        return conf ? conf.klasse : 'B1';
    }

    getInitVoiceName(): string {
        const conf = localStorage.getItem('config');
        if (conf) {
            const cfg: Config = JSON.parse(conf);
            return cfg.stem.length ? cfg.stem : 'Google Nederlands';
        }
        else {
            return 'Google Nederlands';
        }
    }

    private getHuidigSeizoen(): string {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        if (month < 6) {
            return (year - 1) + '-' + year;
        }
        else {
            return year + '-' + (year + 1); 
        }
    }

    // URL HISTORY

    resetHistory() {
        this.urlHistory = [];
        this.writeUrlHistory();
    }

    gotoPage(from: string, to: string) {
        if (!this.urlHistory) {
            this.urlHistory = this.getUrlHistory();
        }
        if (from != '') {
            this.urlHistory.push(from);
            this.writeUrlHistory();    
        }
        this.router.navigate([to]);
    }

    previousPage() {
        if (!this.urlHistory) {
            this.urlHistory = this.getUrlHistory();
        }
        if (!this.urlHistory.length) {
            this.router.navigate(['home']);
            return;
        }
        const url = this.urlHistory.pop();
        this.writeUrlHistory();
        this.router.navigate([url]);
    }

    private writeUrlHistory() {
        if (!this.urlHistory) {
            this.urlHistory = [];
        }
        localStorage.setItem('history', JSON.stringify(this.urlHistory));
    }

    private getUrlHistory(): string[] {
        if (!this.urlHistory) {
            const history = localStorage.getItem('history');
            this.urlHistory = (history) ? JSON.parse(history) : [];
        }
        return this.urlHistory || [];
    }

    // SPELSOORT

    setSpel(spel: Spelsoort) {
        localStorage.setItem('spel', JSON.stringify(spel));
    }

    getSpel(): Spelsoort | undefined {
        const spel = localStorage.getItem('spel');
        if (!spel) {
            this.router.navigate(['home']);
            return undefined;
        }
        return JSON.parse(spel);
    }

    getSpelNaam(): string {
        const spel = this.getSpel();
        return spel ? spel.spelsoortNaam : '';
    }

    getSpelId(): string {
        const spel = this.getSpel();
        if (spel) {
            return spel.spelsoortId;
        }
        else {
            this.alert.showError('Gekozen spel niet gevonden in localStorage! Driebanden gekozen.');
            return '3BA';
        }
    }

}
