import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SpeechService {
    voices: SpeechSynthesisVoice[] = [];
    voice?: SpeechSynthesisVoice;
    speechOn: boolean = false;

    constructor() { }

    speak(txt: string, speakAnyway?: boolean): void {
        if (this.speechOn || speakAnyway) {
            if (this.voice) {
                speechSynthesis.cancel();
                const speech1 = this.makeRequest("");
                speechSynthesis.speak(speech1);  
                setTimeout(() => {
                    speechSynthesis.cancel();
                    const speech2 = this.makeRequest(txt);
                    speechSynthesis.speak(speech2);                        
                }, 250);
            }
            else {
                console.log('voice not set!');
            }    
        }
    }

    speakWithVoice(voiceName: string, txt: string, speakAnyway?: boolean): void {
        if (this.speechOn || speakAnyway) {
            if (voiceName.length) {
                this.voice = this.voices.find(v => v.name === voiceName);
                if (this.voice) {
                    const speech = this.makeRequest(txt);
                    speechSynthesis.speak(speech);        
                }
                else {
                    console.log(`voice ${voiceName} not found!`);
                }
            }
            else {
                console.log('no voice provided!');
            }    
        }
    }

    async getVoices(): Promise<SpeechSynthesisVoice[]> {
        let nrOfTries = 0;
        let result: SpeechSynthesisVoice[] = this.voices;
        while(!result.length && nrOfTries < 3) {
            await this.pause(250);
            result = this.voices;
            nrOfTries++;
        }
        return result;
    }

    private pause(ms: number) { 
        return new Promise(resolve => setTimeout(resolve, ms)); 
    }

    setVoices(voices: SpeechSynthesisVoice[]): void {
        this.voices = voices;
        console.log(this.voices);
    }

    getVoice(): SpeechSynthesisVoice {
        return this.voice ? this.voice : new SpeechSynthesisVoice();
    }

    setVoice(voice: SpeechSynthesisVoice): void {
        this.voice = voice;
        console.log(this.voice);
    }

    setVoiceByName(name: string): void {
        const foundVoice = this.voices.find(v => v.name == name);
        if (foundVoice) {
            this.setVoice(foundVoice);
        }
        else {
            console.error(`Voice '${name}' niet gevonden in voices.`);
        }
    }

    initialize(voiceName: string) {
        const myVoices = speechSynthesis.getVoices();
        if (!myVoices.length) {
            if (speechSynthesis.onvoiceschanged !== undefined) {
                console.log('setting onvoiceschanged event handler');
                speechSynthesis.onvoiceschanged = () => this.getVoicesFromSpeech(voiceName);
            }
        }
        else {
            this.setVoices(myVoices);
            const myVoice = myVoices.find(v => v.name === voiceName);
            if (myVoice) {
                this.setVoice(myVoice);
            }
        }
    }

    private getVoicesFromSpeech(voiceName: string) {
        const myVoices = speechSynthesis.getVoices();
        if (myVoices.length > 0) {
            this.voices = myVoices;
            console.log('clearing onvoiceschanged event handler');
            speechSynthesis.onvoiceschanged = null;
            const myVoice = myVoices.find(v => v.name === voiceName);
            if (myVoice) {
                this.voice = myVoice;
            }
        }
        console.log(this.voices);
        console.log(this.voice);
    }

    private makeRequest(txt: string): SpeechSynthesisUtterance {
        const speech = new SpeechSynthesisUtterance();
        speech.text = txt;
        speech.rate = 1;
        speech.pitch = 0;
        speech.volume = 1;
        speech.lang = 'nl';
        if (this.voice) {
            speech.voice = this.voice;
        }
        return speech;
    }
}
