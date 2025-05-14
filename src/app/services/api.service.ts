import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '../model/api-response';
import { Config } from '../model/config';
import { Spelsoort } from '../model/spelsoort';
import { Speler, SpelerWrapper } from '../model/speler';
import { Lokaliteit, Team, Vereniging, VerenigingKort, VerenigingWrapper } from '../model/vereniging';
import { MoyenneTabel } from '../model/moyenne-tabel';
import { District } from '../model/district';
import { KnbbCompetitie } from '../model/knbb-competitie';
import { Seizoenen } from '../model/seizoenen';
import { OefWedstrijd, OefWedstrijdLeesResultaat } from '../model/oef-wedstrijd';
import { Match, MatchLeesResultaat, TeamMatch, TeamMatchLeesResultaat } from '../model/match';
import { StatusService } from './status.service';
import { BpCompetitie, BpDistrict, BpMoyTabel, CompTemp, TeamPageData } from '../model/bpoint';
import { CmpMatchLeesResultaat, Competitie, CompetitieMatch, CompLeesResultaat } from '../model/competitie';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private stat = inject(StatusService);

    private dbUrl: string;
    private myHeaders: Headers = new Headers();
    private options = {};
    private allowed = false;

    constructor() {
        this.dbUrl = 'http://localhost:8080/bssapi';
        this.myHeaders.append("Content-Type", "application/json");
    }

    async getTeamFromBiljartpoint(teamId: string, compId: string, poule: string, distId: string): Promise<TeamPageData> {
        const url = `/bpoint/team/${teamId}/${compId}/${poule}/${distId}`;
        const result: TeamPageData = await this.getResource(this.dbUrl + url);
        return result;
    }

    async getCompsFromBiljartpoint(distId: string): Promise<BpCompetitie[]> {
        const url = `/bpoint/comps/${distId}`;
        const result: BpCompetitie[] = await this.getResource(this.dbUrl + url);
        return result;
    }

    async getCompFromBiljartpoint(poule: string, compId: string, distId: string): Promise<CompTemp> {
        const url = `/bpoint/comp/${poule}/${compId}/${distId}`;
        const result: CompTemp = await this.getResource(this.dbUrl + url);
        return result;
    }

    async getDistrictenFromBiljartpoint(distId: string): Promise<BpDistrict[]> {
        const url = `/bpoint/distr/${distId}`;
        const result: BpDistrict[] = await this.getResource(this.dbUrl + url);
        return result;
    }

    async getMoyenneTabelFromBiljartpoint(klasse: string): Promise<BpMoyTabel> {
        const url = `/bpoint/moyennes/${klasse}`;
        const result: BpMoyTabel = await this.getResource(this.dbUrl + url);
        return result;
    }

    async configExists(): Promise<boolean> {
        const result: boolean = await this.getResource(this.dbUrl + `/config/exists`, true);
        return result;
    }

    async getConfig(allow?: boolean): Promise<Config> {
        const result: Config = await this.getResource(this.dbUrl + '/config', allow);
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

    async getSpelersLijstVanTeam(spelId: string, spelerIds: string[]): Promise<SpelerWrapper[]> {
        const spelers: Speler[] = await this.getResource(this.dbUrl + '/spelers');
        const result = spelers.filter(spl => spelerIds.some(id => id == spl.id));
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
        const lokaliteiten: Lokaliteit[] = await this.getResource(this.dbUrl + '/lokaliteiten');
        let result: VerenigingWrapper[] = [];
        verenigingen.forEach(ver => {
            const leden: Speler[] = spelers.filter(spl => spl.verenigingIds.some(id => id == ver.verId));
            let lokaliteit = lokaliteiten.find(lok => lok.lokId == ver.locatie) || new Lokaliteit();
            result.push(new VerenigingWrapper(ver, lokaliteit, leden));
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

    async getVerenigingFull(id: string): Promise<VerenigingWrapper> {
        let lok: Lokaliteit = new Lokaliteit();
        const ver: Vereniging = await this.getResource(this.dbUrl + '/verenigingen/' + id);
        if (ver.locatie != '') {
            lok = await this.getLokaliteit(ver.locatie);
        }
        return new VerenigingWrapper(ver, lok);
    }

    async getLedenVanVereniging(verId: string, spel: string): Promise<SpelerWrapper[]> {
        const result: Speler[] = await this.getResource(this.dbUrl + '/spelers?verId=' + verId);
        return result.map(sp => new SpelerWrapper(sp, spel));
    }

    async getLokaliteiten(): Promise<Lokaliteit[]> {
        const result: Lokaliteit[] = await this.getResource(this.dbUrl + '/lokaliteiten');
        return result;
    }

    async getLokaliteit(id: string): Promise<Lokaliteit> {
        const result: Lokaliteit = await this.getResource(this.dbUrl + '/lokaliteiten/' + id);
        return result;
    }

    async getExistingLokaliteitIds(): Promise<string[]> {
        const result: Lokaliteit[] = await this.getResource(this.dbUrl + '/lokaliteiten');
        return result.map(lok => lok.lokId);
    }

    async getMoyenneKlassenLijst(spelsoortId: string): Promise<string[]> {
        const result: MoyenneTabel[] = await this.getResource(this.dbUrl + `/moyennes?spelId=${spelsoortId}`);
        return result.map(tab => tab.klasse);
    }

    async getMoyenneTabel(id: string): Promise<MoyenneTabel> {
        const result: MoyenneTabel = await this.getResource(this.dbUrl + `/moyennes/${id}`);
        return result;
    }

    async getKnbbCompetities(district: string, spel: string): Promise<KnbbCompetitie[]> {
        const result: KnbbCompetitie[] = await this.getResource(this.dbUrl + `/knbb/${district}/${spel}`);
        return result;
    }

    async getKnbbCompetitie(district: string, spel: string, id: string): Promise<KnbbCompetitie> {
        const result: KnbbCompetitie = await this.getResource(this.dbUrl + `/knbb/${district}/${spel}/${id}`);
        return result;
    }

    async getExistingKnbbCompetitieIds(district: string, spel: string): Promise<string[]> {
        const comps: KnbbCompetitie[] = await this.getResource(this.dbUrl + `/knbb/${district}/${spel}`);
        return comps.map(comp => comp.competitieId);
    }

    async getCompetitieList(spelId: string): Promise<string[]> {
        const result: string[] = await this.getResource(this.dbUrl + `/comp`);
        return result.filter(naam => naam.includes(`-${spelId}-`)).map(naam => naam.replace('.json', ''));
    }

    async getCompetitie(naam: string): Promise<CompLeesResultaat> {
        const result: CompLeesResultaat = await this.getResource(this.dbUrl + `/comp/` + naam);
        return result;
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

    async getWedstrijd(): Promise<OefWedstrijdLeesResultaat> {
        const result: OefWedstrijdLeesResultaat = await this.getResource(this.dbUrl + `/wedstrijd`);
        return result;
    }

    async getEigenMatch(): Promise<CmpMatchLeesResultaat> {
        const result: CmpMatchLeesResultaat = await this.getResource(this.dbUrl + `/eigenmatch`);
        return result;
    }

    async getKnbbMatch(): Promise<MatchLeesResultaat> {
        const result: MatchLeesResultaat = await this.getResource(this.dbUrl + `/match`);
        return result;
    }

    async getKnbbTeamMatch(): Promise<TeamMatchLeesResultaat> {
        const result: TeamMatchLeesResultaat = await this.getResource(this.dbUrl + `/teammatch`);
        return result;
    }

    async statsExists(): Promise<boolean> {
        const result: boolean = await this.getResource(this.dbUrl + `/stats/exists`, true);
        return result;
    }

    async getStats(): Promise<any> {
        const result: any = await this.getResource(this.dbUrl + `/stats`, true);
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
        this.stat.setConfig(config);
        return json;
    }

    // STATS

    async createStats(): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + '/stats', {
            method: 'POST',
            body: '',
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

    async addSpelers(spelers: Speler[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + '/spelers', {
            method: 'POST',
            body: JSON.stringify(spelers),
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

    async updateSpelers(spelers: Speler[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + '/spelers', {
            method: 'PUT',
            body: JSON.stringify(spelers),
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

    // LOKALITEIT

    async addLokaliteit(lokaliteit: Lokaliteit): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + '/lokaliteiten', {
            method: 'POST',
            body: JSON.stringify(lokaliteit),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateLokaliteit(lokaliteit: Lokaliteit): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/lokaliteiten/${lokaliteit.lokId}`, {
            method: 'PUT',
            body: JSON.stringify(lokaliteit),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteLokaliteit(lokaliteit: Lokaliteit): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/lokaliteiten/${lokaliteit.lokId}`, {
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
        const response: Response = await fetch(this.dbUrl + `/knbb/${comp.district}/${comp.spelsoort}`, {
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
        const response: Response = await fetch(this.dbUrl + `/knbb/${comp.district}/${comp.spelsoort}/${comp.competitieId}`, {
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
        const response: Response = await fetch(this.dbUrl + `/knbb/${comp.district}/${comp.spelsoort}/${comp.competitieId}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // WEDSTRIJD

    async saveWedstrijd(wedstrijd: OefWedstrijd): Promise<ApiResponse> {
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

    // EIGEN MATCH

    async saveEigenMatch(match: CompetitieMatch): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/eigenmatch`, {
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

    // SINGLE MATCH

    async saveKnbbMatch(match: Match): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/match`, {
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

    // EIGEN COMP

    async saveCompetitie(comp: Competitie): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/comp/` + comp.cmpNaam, {
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

    async deleteCompetitie(naam: string): Promise<ApiResponse> {
        const response: Response = await fetch(this.dbUrl + `/comp/` + naam, {
            method: 'DELETE'
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

    async getResource(url: string, allow?: boolean) {
        if (!this.stat.isAllowed(allow)) {
            throw new Error('Illegale versie. Ophalen data niet toegestaan');
        }
        const response: Response = await fetch(url);
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json.data;
    }

}
