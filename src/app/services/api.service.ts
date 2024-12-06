import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../model/api-response';
import { Config } from '../model/config';
import { Spelsoort } from '../model/spelsoort';
import { Speler, SpelerWrapper } from '../model/speler';
import { Team, TeamWrapper, Vereniging, VerenigingKort, VerenigingWrapper } from '../model/vereniging';
import { MoyenneTabel } from '../model/moyenne-tabel';
import { District } from '../model/district';
import { KnbbCompetitie } from '../model/knbb-competitie';
import { Seizoenen } from '../model/seizoenen';
import { Wedstrijd, WedstrijdLeesResultaat } from '../model/wedstrijd';
import { TeamMatch, TeamMatchLeesResultaat } from '../model/match';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    //private http = inject(HttpClient);

    private dbUrl: string;
    private myHeaders: Headers = new Headers();
    private options = {};

    constructor() {
        this.dbUrl = 'http://localhost:8080/bssapi';
        this.myHeaders.append("Content-Type", "application/json");
    }

    async getConfig(): Promise<Config> {
        const result: Config = await this.getResource(this.dbUrl + '/config');
        return result;
    }

    async getSpelsoorten(): Promise<Spelsoort[]> {
        const result: Spelsoort[] = await this.getResource(this.dbUrl + '/spelsoorten');
        return result;
    }

    async getSpelers(): Promise<Speler[]> {
        const result: Speler[] = await this.getResource(this.dbUrl + '/spelers');
        return result;
    }

    async getSpelersLijst(spelId: string): Promise<SpelerWrapper[]> {
        const result: Speler[] = await this.getResource(this.dbUrl + '/spelers');
        return result.map(sp => new SpelerWrapper(sp, spelId));
    }

    async getExistingSpelerIds(): Promise<string[]> {
        const result: Speler[] = await this.getResource(this.dbUrl + '/spelers');
        return result.map(sp => sp.id);
    }

    async getSpeler(id: string): Promise<Speler> {
        const result: Speler = await this.getResource(this.dbUrl + '/spelers/' + id);
        return result;
    }

    async getVerenigingen(): Promise<Vereniging[]> {
        const result: Vereniging[] = await this.getResource(this.dbUrl + '/verenigingen');
        return result;
    }

    async getVerenigingenLijst(): Promise<VerenigingWrapper[]> {
        const verenigingen: Vereniging[] = await this.getResource(this.dbUrl + '/verenigingen');
        const spelers: Speler[] = await this.getResource(this.dbUrl + '/spelers');
        let result: VerenigingWrapper[] = [];
        verenigingen.forEach(ver => {
            const leden: Speler[] = spelers.filter(spl => spl.verenigingIds.some(id => id == ver.verId));
            result.push(new VerenigingWrapper(ver, leden));
        })
        return result;
    }

    async getTeamsForSpelAndKlasse(spel: string, klasse: string): Promise<Team[]> {
        const verenigingen: Vereniging[] = await this.getResource(this.dbUrl + '/verenigingen');
        let result: Team[] = [];
        verenigingen.forEach(vereniging => {
            vereniging.teams.forEach(team => {
                if (team.spelsoort == spel && team.klasse == klasse) {
                    result.push(team);
                }
            });
        })
        return result;
    }

    async getVerenigingenKort(): Promise<VerenigingKort[]> {
        const result: Vereniging[] = await this.getResource(this.dbUrl + '/verenigingen');
        return result.map(v => new VerenigingKort(v));
    }

    async getExistingVerenigingIds(): Promise<string[]> {
        const result: Vereniging[] = await this.getResource(this.dbUrl + '/verenigingen');
        return result.map(ver => ver.verId);
    }

    async getVereniging(id: string): Promise<Vereniging> {
        const result: Vereniging = await this.getResource(this.dbUrl + '/verenigingen/' + id);
        return result;
    }

    async getLedenVanVereniging(verId: string, spel: string): Promise<SpelerWrapper[]> {
        const result: Speler[] = await this.getResource(this.dbUrl + '/spelers?verId=' + verId);
        return result.map(sp => new SpelerWrapper(sp, spel));
    }

    async getMoyenneKlassenLijst(spelsoortId: string): Promise<string[]> {
        const result: MoyenneTabel[] = await this.getResource(this.dbUrl + `/moyennes?spelId=${spelsoortId}`);
        return result.map(tab => tab.klasse);
    }

    async getMoyenneTabel(id: string): Promise<MoyenneTabel> {
        const result: MoyenneTabel = await this.getResource(this.dbUrl + `/moyennes/${id}`);
        return result;
    }

    async getKnbbCompetities(seizoen: string, district: string, spel: string): Promise<KnbbCompetitie[]> {
        const result: KnbbCompetitie[] = await this.getResource(this.dbUrl + `/knbb/${seizoen}/${district}/${spel}`);
        return result;
    }

    async getKnbbCompetitie(seizoen: string, district: string, spel: string, id: string): Promise<KnbbCompetitie> {
        const result: KnbbCompetitie = await this.getResource(this.dbUrl + `/knbb/${seizoen}/${district}/${spel}/${id}`);
        return result;
    }

    async getExistingKnbbCompetitieIds(seizoen: string, district: string, spel: string): Promise<string[]> {
        const comps: KnbbCompetitie[] = await this.getResource(this.dbUrl + `/knbb/${seizoen}/${district}/${spel}`);
        return comps.map(comp => comp.competitieId);
    }

    async getKnbbDistricten(): Promise<District[]> {
        const result: District[] = await this.getResource(this.dbUrl + `/districten`);
        return result;
    }

    async getKnbbDistrict(id: string): Promise<District> {
        const result: District = await this.getResource(this.dbUrl + `/districten/${id}`);
        return result;
    }

    async getSeizoenen(): Promise<Seizoenen> {
        const result: Seizoenen = await this.getResource(this.dbUrl + `/seizoenen`);
        return result;
    }

    async getSeizoenenKnbb(): Promise<string[]> {
        const seizoenen: Seizoenen = await this.getResource(this.dbUrl + `/seizoenen`);
        const compSeizoenen = seizoenen.compSeizoenen.find(cs => cs.compId == 'knbb');
        if (!compSeizoenen) {
            return [];
        }
        return compSeizoenen.seizoenen;
    }

    async getWedstrijd(): Promise<WedstrijdLeesResultaat> {
        const result: WedstrijdLeesResultaat = await this.getResource(this.dbUrl + `/wedstrijd`);
        return result;
    }

    async getKnbbTeamMatch(): Promise<TeamMatchLeesResultaat> {
        const result: TeamMatchLeesResultaat = await this.getResource(this.dbUrl + `/teammatch`);
        return result;
    }

    // CONFIG

    async saveConfig(config: Config): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + '/config', {
            method: 'POST',
            body: JSON.stringify(config),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // SPELSOORT

    async addSpelsoort(spelsoort: Spelsoort): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + '/spelsoorten', {
            method: 'POST',
            body: JSON.stringify(spelsoort),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateSpelsoort(spelsoort: Spelsoort): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/spelsoorten/${spelsoort.spelsoortId}`, {
            method: 'PUT',
            body: JSON.stringify(spelsoort),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteSpelsoort(spelsoort: Spelsoort): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/spelsoorten/${spelsoort.spelsoortId}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // SPELER

    async addSpeler(speler: Speler): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + '/spelers', {
            method: 'POST',
            body: JSON.stringify(speler),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateSpeler(speler: Speler): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/spelers/${speler.id}`, {
            method: 'PUT',
            body: JSON.stringify(speler),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteSpeler(speler: Speler): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/spelers/${speler.id}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // VERENIGING

    async addVereniging(vereniging: Vereniging): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + '/verenigingen', {
            method: 'POST',
            body: JSON.stringify(vereniging),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateVereniging(vereniging: Vereniging): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/verenigingen/${vereniging.verId}`, {
            method: 'PUT',
            body: JSON.stringify(vereniging),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteVereniging(vereniging: Vereniging): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/verenigingen/${vereniging.verId}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // MOYENNE TABELLEN

    async addMoyenneTabel(tabel: MoyenneTabel): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/moyennes`, {
            method: 'POST',
            body: JSON.stringify(tabel),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateMoyenneTabel(tabel: MoyenneTabel): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/moyennes/${tabel.tabId}`, {
            method: 'PUT',
            body: JSON.stringify(tabel),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteMoyenneTabel(tabelId: string): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/moyennes/${tabelId}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // DISTRICTEN

    async addDistrict(district: District): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/districten`, {
            method: 'POST',
            body: JSON.stringify(district),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateDistrict(district: District): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/districten/${district.disId}`, {
            method: 'PUT',
            body: JSON.stringify(district),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteDistrict(id: string): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/districten/${id}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // KNBB COMPETITIES

    async addKnbbCompetitie(comp: KnbbCompetitie): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/knbb/${comp.seizoen}/${comp.district}/${comp.spelsoort}`, {
            method: 'POST',
            body: JSON.stringify(comp),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateKnbbCompetitie(comp: KnbbCompetitie): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/knbb/${comp.seizoen}/${comp.district}/${comp.spelsoort}/${comp.competitieId}`, {
            method: 'PUT',
            body: JSON.stringify(comp),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteKnbbCompetitie(comp: KnbbCompetitie): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/knbb/${comp.seizoen}/${comp.district}/${comp.spelsoort}/${comp.competitieId}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // WEDSTRIJD

    async saveWedstrijd(wedstrijd: Wedstrijd): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/wedstrijd`, {
            method: 'POST',
            body: JSON.stringify(wedstrijd),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // TEAM MATCH

    async saveKnbbTeamMatch(match: TeamMatch): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/teammatch`, {
            method: 'POST',
            body: JSON.stringify(match),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // SEIZOENEN

    async saveSeizoenen(seizoenen: Seizoenen): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/seizoenen`, {
            method: 'POST',
            body: JSON.stringify(seizoenen),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // GENERAL

    async getResource(url: string) {
        const response: Response = await fetch(url);
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json.data;
    }

}
