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
import { Match, MatchLeesResultaat, TeamMatch, TeamMatchLeesResultaat } from '../model/match';
import { StatusService } from './status.service';
import { BpCompetitie, BpDistrict, BpMoyTabel, CompTemp, TeamPageData } from '../model/bpoint';
import { CmpMatchLeesResultaat, Competitie, CompetitieMatch, CompLeesResultaat } from '../model/competitie';
import { Wedstrijd, WedstrijdLeesResultaat } from '../model/wedstrijd';
import { Annonceer, AnnonLeesResultaat } from '../model/annonceer';
import { Account } from '../model/account';
import { HelperService } from './helper.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private stat = inject(StatusService);
    private helper = inject(HelperService);

    private apiUrl: string;
    private webUrl: string;
    private myHeaders: Headers = new Headers();
    private options = {};
    private allowed = false;

    constructor() {
        this.apiUrl = 'http://localhost:8080/bssapi';
        this.webUrl = 'http://localhost:8081/bssweb';
        this.myHeaders.append("Content-Type", "application/json");
    }

    async getRemoteMode(): Promise<boolean> {
        const response: Response = await fetch(this.webUrl);
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return true;
    }

    async getTeamFromBiljartpoint(teamId: string, compId: string, poule: string, distId: string): Promise<TeamPageData> {
        const url = `/bpoint/team/${teamId}/${compId}/${poule}/${distId}`;
        const result: TeamPageData = await this.getResource(this.apiUrl + url);
        return result;
    }

    async getCompsFromBiljartpoint(distId: string): Promise<BpCompetitie[]> {
        const url = `/bpoint/comps/${distId}`;
        const result: BpCompetitie[] = await this.getResource(this.apiUrl + url);
        return result;
    }

    async getCompFromBiljartpoint(poule: string, compId: string, distId: string): Promise<CompTemp> {
        const url = `/bpoint/comp/${poule}/${compId}/${distId}`;
        const result: CompTemp = await this.getResource(this.apiUrl + url);
        return result;
    }

    async getDistrictenFromBiljartpoint(distId: string): Promise<BpDistrict[]> {
        const url = `/bpoint/distr/${distId}`;
        const result: BpDistrict[] = await this.getResource(this.apiUrl + url);
        return result;
    }

    async getMoyenneTabelFromBiljartpoint(klasse: string): Promise<BpMoyTabel> {
        const url = `/bpoint/moyennes/${klasse}`;
        const result: BpMoyTabel = await this.getResource(this.apiUrl + url);
        return result;
    }

    async configExists(): Promise<boolean> {
        const result: boolean = await this.getResource(this.apiUrl + `/config/exists`, true);
        return result;
    }

    async getConfig(allow?: boolean): Promise<Config> {
        const result: Config = await this.getResource(this.apiUrl + '/config', allow);
        return result;
    }

    async getSpelsoorten(): Promise<Spelsoort[]> {
        const result: Spelsoort[] = await this.getResource(this.apiUrl + '/spelsoorten');
        return result;
    }

    async getAccounts(local?: boolean): Promise<Account[]> {
        const url = (this.stat.isRemote() && !local) ? this.webUrl : this.apiUrl;
        const result: Account[] = await this.getResource(url + '/accounts');
        return result;
    }

    async getAccount(id: string, local?: boolean): Promise<Account> {
        const url = (this.stat.isRemote() && !local) ? this.webUrl : this.apiUrl;
        const result: Account = await this.getResource(url + '/Accounts/' + id);
        return result;
    }

    async getSpelers(): Promise<Speler[]> {
        const result: Speler[] = await this.getResource(this.apiUrl + '/spelers');
        return result;
    }

    async getSpelersLijst(spelId: string): Promise<SpelerWrapper[]> {
        const result: Speler[] = await this.getResource(this.apiUrl + '/spelers');
        return result.map(sp => new SpelerWrapper(sp, spelId));
    }

    async getSpelersLijstVanTeam(spelId: string, spelerIds: string[]): Promise<SpelerWrapper[]> {
        const spelers: Speler[] = await this.getResource(this.apiUrl + '/spelers');
        const result = spelers.filter(spl => spelerIds.some(id => id == spl.id));
        return result.map(sp => new SpelerWrapper(sp, spelId));
    }

    async getExistingSpelerIds(): Promise<string[]> {
        const result: Speler[] = await this.getResource(this.apiUrl + '/spelers');
        return result.map(sp => sp.id);
    }

    async getSpeler(id: string): Promise<Speler> {
        const result: Speler = await this.getResource(this.apiUrl + '/spelers/' + id);
        return result;
    }

    async getVerenigingen(): Promise<Vereniging[]> {
        const result: Vereniging[] = await this.getResource(this.apiUrl + '/verenigingen');
        return result;
    }

    async getVerenigingenLijst(): Promise<VerenigingWrapper[]> {
        const verenigingen: Vereniging[] = await this.getResource(this.apiUrl + '/verenigingen');
        const spelers: Speler[] = await this.getResource(this.apiUrl + '/spelers');
        const lokaliteiten: Lokaliteit[] = await this.getResource(this.apiUrl + '/lokaliteiten');
        let result: VerenigingWrapper[] = [];
        verenigingen.forEach(ver => {
            const leden: Speler[] = spelers.filter(spl => spl.verenigingIds.some(id => id == ver.verId));
            let lokaliteit = lokaliteiten.find(lok => lok.lokId == ver.locatie) || new Lokaliteit();
            result.push(new VerenigingWrapper(ver, lokaliteit, leden));
        })
        return result;
    }

    async getTeamsForSpelAndKlasse(spel: string, klasse: string): Promise<Team[]> {
        const verenigingen: Vereniging[] = await this.getResource(this.apiUrl + '/verenigingen');
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
        const result: Vereniging[] = await this.getResource(this.apiUrl + '/verenigingen');
        return result.map(v => new VerenigingKort(v));
    }

    async getExistingVerenigingIds(): Promise<string[]> {
        const result: Vereniging[] = await this.getResource(this.apiUrl + '/verenigingen');
        return result.map(ver => ver.verId);
    }

    async getVereniging(id: string): Promise<Vereniging> {
        const result: Vereniging = await this.getResource(this.apiUrl + '/verenigingen/' + id);
        return result;
    }

    async getVerenigingFull(id: string): Promise<VerenigingWrapper> {
        let lok: Lokaliteit = new Lokaliteit();
        const ver: Vereniging = await this.getResource(this.apiUrl + '/verenigingen/' + id);
        if (ver.locatie != '') {
            lok = await this.getLokaliteit(ver.locatie);
        }
        return new VerenigingWrapper(ver, lok);
    }

    async getLedenVanVereniging(verId: string, spel: string): Promise<SpelerWrapper[]> {
        const result: Speler[] = await this.getResource(this.apiUrl + '/spelers?verId=' + verId);
        return result.map(sp => new SpelerWrapper(sp, spel));
    }

    async getLokaliteiten(): Promise<Lokaliteit[]> {
        const result: Lokaliteit[] = await this.getResource(this.apiUrl + '/lokaliteiten');
        return result;
    }

    async getLokaliteit(id: string): Promise<Lokaliteit> {
        const result: Lokaliteit = await this.getResource(this.apiUrl + '/lokaliteiten/' + id);
        return result;
    }

    async getExistingLokaliteitIds(): Promise<string[]> {
        const result: Lokaliteit[] = await this.getResource(this.apiUrl + '/lokaliteiten');
        return result.map(lok => lok.lokId);
    }

    async getMoyenneKlassenLijst(spelsoortId: string): Promise<string[]> {
        const result: MoyenneTabel[] = await this.getResource(this.apiUrl + `/moyennes?spelId=${spelsoortId}`);
        return result.map(tab => tab.klasse);
    }

    async getMoyenneTabel(id: string): Promise<MoyenneTabel> {
        const result: MoyenneTabel = await this.getResource(this.apiUrl + `/moyennes/${id}`);
        return result;
    }

    async getKnbbCompetities(district: string, spel: string): Promise<KnbbCompetitie[]> {
        const result: KnbbCompetitie[] = await this.getResource(this.apiUrl + `/knbb/${district}/${spel}`);
        return result;
    }

    async getKnbbCompetitie(district: string, spel: string, id: string): Promise<KnbbCompetitie> {
        const result: KnbbCompetitie = await this.getResource(this.apiUrl + `/knbb/${district}/${spel}/${id}`);
        return result;
    }

    async getExistingKnbbCompetitieIds(district: string, spel: string): Promise<string[]> {
        const comps: KnbbCompetitie[] = await this.getResource(this.apiUrl + `/knbb/${district}/${spel}`);
        return comps.map(comp => comp.competitieId);
    }

    async getCompetitieList(spelId: string): Promise<string[]> {
        const result: string[] = await this.getResource(this.apiUrl + `/comp`);
        return result.filter(naam => naam.includes(`-${spelId}-`)).map(naam => naam.replace('.json', ''));
    }

    async getCompetitie(naam: string): Promise<CompLeesResultaat> {
        const result: CompLeesResultaat = await this.getResource(this.apiUrl + `/comp/` + naam);
        return result;
    }

    async getKnbbDistricten(): Promise<District[]> {
        const result: District[] = await this.getResource(this.apiUrl + `/districten`);
        return result;
    }

    async getKnbbDistrict(id: string): Promise<District> {
        const result: District = await this.getResource(this.apiUrl + `/districten/${id}`);
        return result;
    }

    async getSeizoenen(): Promise<Seizoenen> {
        const result: Seizoenen = await this.getResource(this.apiUrl + `/seizoenen`);
        return result;
    }

    async getSeizoenenKnbb(): Promise<string[]> {
        const seizoenen: Seizoenen = await this.getResource(this.apiUrl + `/seizoenen`);
        const compSeizoenen = seizoenen.compSeizoenen.find(cs => cs.compId == 'knbb');
        if (!compSeizoenen) {
            return [];
        }
        return compSeizoenen.seizoenen;
    }

    async getWedstrijd(): Promise<WedstrijdLeesResultaat> {
        const result: WedstrijdLeesResultaat = await this.getResource(this.apiUrl + `/wedstrijd`);
        return result;
    }

    async getAnnonWedstrijd(): Promise<AnnonLeesResultaat> {
        const result: AnnonLeesResultaat = await this.getResource(this.apiUrl + `/annon`);
        return result;
    }

    async getEigenMatch(): Promise<CmpMatchLeesResultaat> {
        const result: CmpMatchLeesResultaat = await this.getResource(this.apiUrl + `/eigenmatch`);
        return result;
    }

    async getKnbbMatch(): Promise<MatchLeesResultaat> {
        const result: MatchLeesResultaat = await this.getResource(this.apiUrl + `/match`);
        return result;
    }

    async getKnbbTeamMatch(): Promise<TeamMatchLeesResultaat> {
        const result: TeamMatchLeesResultaat = await this.getResource(this.apiUrl + `/teammatch`);
        return result;
    }

    async statsExists(): Promise<boolean> {
        const result: boolean = await this.getResource(this.apiUrl + `/stats/exists`, true);
        return result;
    }

    async getStats(): Promise<any> {
        const result: any = await this.getResource(this.apiUrl + `/stats`, true);
        return result;
    }

    // CONFIG

    async saveConfig(config: Config): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + '/config', {
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
        const response: Response = await fetch(this.apiUrl + '/stats', {
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

    // ACCOUNT

    async addAccount(account: Account, local?: boolean): Promise<ApiResponse> {
        const url = (this.stat.isRemote() && !local) ? this.webUrl : this.apiUrl;
        const response: Response = await fetch(url + '/accounts', {
            method: 'POST',
            body: JSON.stringify(account),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateAccount(account: Account, local?: boolean): Promise<ApiResponse> {
        account.dlw = this.helper.getDateTimeAsString(new Date());
        const url = (this.stat.isRemote() && !local) ? this.webUrl : this.apiUrl;
        const response: Response = await fetch(url + `/accounts/${account.userId}`, {
            method: 'PUT',
            body: JSON.stringify(account),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async deleteAccount(account: Account, local?: boolean): Promise<ApiResponse> {
        const url = (this.stat.isRemote() && !local) ? this.webUrl : this.apiUrl;
        const response: Response = await fetch(url + `/accounts/${account.userId}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // SPELSOORT

    async addSpelsoort(spelsoort: Spelsoort): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + '/spelsoorten', {
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
        const response: Response = await fetch(this.apiUrl + `/spelsoorten/${spelsoort.spelsoortId}`, {
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
        const response: Response = await fetch(this.apiUrl + `/spelsoorten/${spelsoort.spelsoortId}`, {
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
        const response: Response = await fetch(this.apiUrl + '/spelers', {
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
        const response: Response = await fetch(this.apiUrl + `/spelers/${speler.id}`, {
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
        const response: Response = await fetch(this.apiUrl + '/spelers', {
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
        const response: Response = await fetch(this.apiUrl + `/spelers/${speler.id}`, {
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
        const response: Response = await fetch(this.apiUrl + '/verenigingen', {
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

    async saveVerenigingen(verenigingen: Vereniging[]): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + '/verenigingen', {
            method: 'PUT',
            body: JSON.stringify(verenigingen),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async updateVereniging(vereniging: Vereniging): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/verenigingen/${vereniging.verId}`, {
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
        const response: Response = await fetch(this.apiUrl + `/verenigingen/${vereniging.verId}`, {
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
        const response: Response = await fetch(this.apiUrl + '/lokaliteiten', {
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
        const response: Response = await fetch(this.apiUrl + `/lokaliteiten/${lokaliteit.lokId}`, {
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
        const response: Response = await fetch(this.apiUrl + `/lokaliteiten/${lokaliteit.lokId}`, {
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
        const response: Response = await fetch(this.apiUrl + `/moyennes`, {
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
        const response: Response = await fetch(this.apiUrl + `/moyennes/${tabel.tabId}`, {
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
        const response: Response = await fetch(this.apiUrl + `/moyennes/${tabelId}`, {
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
        const response: Response = await fetch(this.apiUrl + `/districten`, {
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
        const response: Response = await fetch(this.apiUrl + `/districten/${district.disId}`, {
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
        const response: Response = await fetch(this.apiUrl + `/districten/${id}`, {
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
        const response: Response = await fetch(this.apiUrl + `/knbb/${comp.district}/${comp.spelsoort}`, {
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
        const response: Response = await fetch(this.apiUrl + `/knbb/${comp.district}/${comp.spelsoort}/${comp.competitieId}`, {
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
        const response: Response = await fetch(this.apiUrl + `/knbb/${comp.district}/${comp.spelsoort}/${comp.competitieId}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async saveKnbbCompetities(comps: KnbbCompetitie[], distId: string, spelId: string): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/knbb/${distId}/${spelId}`, {
            method: 'PUT',
            body: JSON.stringify(comps),
            headers: this.myHeaders
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    // WEDSTRIJD

    async saveWedstrijd(wedstrijd: Wedstrijd): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/wedstrijd`, {
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

    // ANNONCEER WEDSTRIJD

    async saveAnnonWedstrijd(annon: Annonceer): Promise<ApiResponse> {
        const response: Response = await fetch(this.apiUrl + `/annon`, {
            method: 'POST',
            body: JSON.stringify(annon),
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
        const response: Response = await fetch(this.apiUrl + `/eigenmatch`, {
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
        const response: Response = await fetch(this.apiUrl + `/match`, {
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
        const response: Response = await fetch(this.apiUrl + `/teammatch`, {
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
        const response: Response = await fetch(this.apiUrl + `/comp/` + comp.cmpNaam, {
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
        const response: Response = await fetch(this.apiUrl + `/comp/` + naam, {
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
        const response: Response = await fetch(this.apiUrl + `/seizoenen`, {
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
