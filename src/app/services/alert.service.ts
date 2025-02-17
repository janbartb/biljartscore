import { Injectable } from '@angular/core';
import { Alert } from '../model/alert';

@Injectable({
    providedIn: 'root'
})
export class AlertService {
    visible: boolean = false;
    helpVisible: boolean = false;
    alert: Alert = new Alert();

    constructor() { }

    showAlert(msg: string, type: string, dur?: number) {
        if (type == 'error') {
            console.error(msg);
        }
        this.alert.text = msg;
        this.alert.type = type;
        this.alert.clazz = this.getClass(type);
        this.alert.duration = dur ? dur : 0;
        this.visible = true;
        if (!this.alert.duration && this.alert.type != 'error') {
            this.alert.duration = 3;
        } 
        if (this.alert.duration) {
            setTimeout(() => {
                this.visible = false;
            }, this.alert.duration * 1000);
        }
    }

    showError(err: string) {
        this.showAlert(err, 'error', 8);
    }

    showHelp() {
        this.helpVisible = true;
    }

    hideHelp() {
        this.helpVisible = false;
    }

    private getClass(type: string): string {
        if (type == 'error') {
            return 'w3-red';
        }
        if (type == 'warning') {
            return 'w3-yellow';
        }
        if (type == 'success') {
            return 'w3-green';
        }
        return 'w3-blue';
    }
}
