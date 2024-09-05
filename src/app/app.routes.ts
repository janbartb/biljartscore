import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OnderhoudComponent } from './onderhoud/onderhoud.component';
import { ConfigComponent } from './onderhoud/config/config.component';
import { SpelsoortenComponent } from './onderhoud/spelsoorten/spelsoorten.component';
import { VerenigingenComponent } from './onderhoud/verenigingen/verenigingen.component';
import { SpelersComponent } from './onderhoud/spelers/spelers.component';
import { SpelerComponent } from './onderhoud/spelers/speler/speler.component';

export const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'onderhoud/verenigingen', component: VerenigingenComponent },
    { path: 'onderhoud/spelers/:spelerId', component: SpelerComponent },
    { path: 'onderhoud/spelers', component: SpelersComponent },
    { path: 'onderhoud/spelsoorten', component: SpelsoortenComponent },
    { path: 'onderhoud/instellingen', component: ConfigComponent },
    { path: 'onderhoud', component: OnderhoudComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
