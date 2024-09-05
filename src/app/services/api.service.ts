import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../model/api-response';
import { Config } from '../model/config';
import { Spelsoort } from '../model/spelsoort';
import { Speler, SpelerWrapper } from '../model/speler';
import { Vereniging } from '../model/vereniging';

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

    async getSpelers(): Promise<SpelerWrapper[]> {
        const result: Speler[] = await this.getResource(this.dbUrl + '/spelers');
        return result.map(sp => new SpelerWrapper(sp));
    }

    async getSpeler(id: string): Promise<Speler> {
        const result: Speler = await this.getResource(this.dbUrl + '/spelers/' + id);
        return result;
    }

    async getVerenigingen(): Promise<Vereniging[]> {
        const result: Vereniging[] = await this.getResource(this.dbUrl + '/verenigingen');
        return result;
    }

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
        const response: Response = await fetch(this.dbUrl + `/spelsoorten/${spelsoort.spelId}`, {
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
        const response: Response = await fetch(this.dbUrl + `/spelsoorten/${spelsoort.spelId}`, {
            method: 'DELETE'
        });
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json;
    }

    async getResource(url: string) {
        const response: Response = await fetch(url);
        const json: ApiResponse = await response.json();
        if (!response.ok) {
            throw new Error(json.message);
        }
        return json.data;
    }

    // saveConfig(config: Config): Observable<ApiResponse> {
    //     return this.http.post<ApiResponse>(this.dbUrl + '/config', config, this.options)
    //         .pipe(
    //             catchError(this.handleError)
    //         )
    // }

    // getMatch(): Observable<MatchLeesResultaat> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/match')
    //         .pipe(
    //             map(resp => resp.data as MatchLeesResultaat),
    //             catchError(this.handleError)
    //         );
    // }

    // saveMatch(match: Match): Observable<ApiResponse> {
    //     return this.http.post<ApiResponse>(this.dbUrl + '/match', match, this.options)
    //         .pipe(
    //             catchError(this.handleError)
    //         )
    // }

    // getVerenigingen(): Observable<Vereniging[]> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/verenigingen')
    //         .pipe(
    //             map(resp => resp.data as Vereniging[]),
    //             catchError(this.handleError)
    //         );
    // }

    // getVerenigingenLijst(): Observable<VerenigingShort[]> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/verenigingen/lijst')
    //         .pipe(
    //             map(resp => resp.data as VerenigingShort[]),
    //             catchError(this.handleError)
    //         );
    // }

    // getVereniging(id: string): Observable<Vereniging> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/verenigingen/' + id)
    //         .pipe(
    //             map(resp => resp.data as Vereniging),
    //             catchError(this.handleError)
    //         );
    // }

    // findVerenigingById(id: string): Observable<Vereniging[]> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/verenigingen?id=' + id)
    //         .pipe(
    //             map(resp => resp.data as Vereniging[]),
    //             catchError(this.handleError)
    //         );
    // }

    // addVereniging(vereniging: Vereniging): Observable<Vereniging> {
    //     return this.http.post<ApiResponse>(this.dbUrl + `/verenigingen`, vereniging, this.options)
    //         .pipe(
    //             tap(resp => console.log(`Vereniging ${resp.data.id} toegevoegd.`)),
    //             map(resp => resp.data as Vereniging),
    //             catchError(this.handleError)
    //         );
    // }

    // updateVereniging(vereniging: Vereniging): Observable<Vereniging> {
    //     return this.http.put<ApiResponse>(this.dbUrl + `/verenigingen/${vereniging.id}`, vereniging, this.options)
    //         .pipe(
    //             tap(resp => console.log(`Vereniging ${resp.data.id} updated.`)),
    //             map(resp => resp.data as Vereniging),
    //             catchError(this.handleError)
    //         );
    // }

    // deleteVereniging(vereniging: Vereniging): Observable<string> {
    //     return this.http.delete<ApiResponse>(this.dbUrl + `/verenigingen/${vereniging.id}`)
    //         .pipe(
    //             map(resp => resp.data as string),
    //             tap(resp => console.log(resp)),
    //             catchError(this.handleError)
    //         );
    // }

    // getMoyenneTabellen(): Observable<MoyenneTabel[]> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/moyennes')
    //         .pipe(
    //             map(resp => resp.data as MoyenneTabel[]),
    //             catchError(this.handleError)
    //         );
    // }

    // getMoyenneKlassenLijst(): Observable<string[]> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/moyennes/klassen')
    //         .pipe(
    //             map(resp => resp.data as string[]),
    //             catchError(this.handleError)
    //         );
    // }

    // getMoyenneTabel(klasse: string): Observable<MoyenneTabel> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/moyennes/' + klasse)
    //         .pipe(
    //             map(resp => resp.data as MoyenneTabel),
    //             catchError(this.handleError)
    //         );
    // }

    // saveMoyenneTabellen(tabellen: MoyenneTabel[]): Observable<ApiResponse> {
    //     return this.http.post<ApiResponse>(this.dbUrl + '/moyennes', tabellen, this.options)
    //         .pipe(
    //             catchError(this.handleError)
    //         )
    // }

    // getSpreeknamen(): Observable<Spreeknaam[]> {
    //     return this.http.get<ApiResponse>(this.dbUrl + '/spreeknamen')
    //         .pipe(
    //             map(resp => resp.data as Spreeknaam[]),
    //             catchError(this.handleError)
    //         );
    // }

    // private handleError(err: HttpErrorResponse): Observable<never> {
    //     // in a real world app, we may send the server to some remote logging infrastructure
    //     // instead of just logging it to the console
    //     let errorMessage = '';
    //     if (err.error instanceof ErrorEvent) {
    //         // A client-side or network error occurred. Handle it accordingly.
    //         errorMessage = `An error occurred: ${err.error.message}`;
    //     } else {
    //         // The backend returned an unsuccessful response code.
    //         // The response body may contain clues as to what went wrong,
    //         errorMessage = `Server returned code: ${err.status}, error message is: ${err.error.message}`;
    //     }
    //     console.error(errorMessage);
    //     return throwError(() => errorMessage);
    // }
}
