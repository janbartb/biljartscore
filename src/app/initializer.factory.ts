import { inject } from "@angular/core";
import { ApiService } from "./services/api.service";
import { StatusService } from "./services/status.service";
import { SpeechService } from "./services/speech.service";

export function initializerFactory() {
    console.log('START INITIALIZING...');
    let api = inject(ApiService);
    let app = inject(StatusService);
    let spraak = inject(SpeechService);
    api.getConfig(true)
    .then(cfg => {
        app.setConfig(cfg);
        console.log('CONFIG INITIALIZED');
        spraak.speechOn = cfg.speech;
        spraak.initialize(app.getInitVoiceName());
        console.log('SPEECH INITIALIZED');
        console.log('END INITIALIZING');
    })
    .catch(err => {
        console.log('ERROR INITIALIZING CONFIG : ' + err);
    });
    
}