import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { initializerFactory } from './initializer.factory';
import { DecimalPipe } from '@angular/common';

export const appConfig: ApplicationConfig = {
    providers: [
        DecimalPipe,
        provideZoneChangeDetection({ eventCoalescing: true }), 
        provideRouter(routes),
        provideHttpClient(withFetch()),
        {
            provide: APP_INITIALIZER,
            useFactory: initializerFactory
        }
    ]

};
