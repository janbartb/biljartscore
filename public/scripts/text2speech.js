var mySpeechObject = (function () {

    var msg = createUtterance(' ');
    speechSynthesis.speak(msg);
    var voices = [];
    setTimeout(() => {
        voices = speechSynthesis.getVoices();
        //msg.text = 'Spraak geactiveerd';
        msg.voice = voices.filter(function(voice) { return voice.name == 'Google Nederlands'; })[0];
        //speechSynthesis.speak(msg);
        console.log(msg);
        console.log(voices);
    }, 250);

    return {
        speak: function(textToSay, omitSpeech) {
            if (('speechSynthesis' in window) && !omitSpeech) {
                // var voice = voices.filter(function(voice) { return voice.name == 'Google Nederlands'; })[0];
                // if (voiceName && voiceName != '') {
                //     voice = voices.filter(function(voice) { return voice.name == voiceName; })[0];
                // }
                speechSynthesis.cancel();
                speechSynthesis.speak(createUtterance(' '));
                //speechSynthesis.speak(createUtterance(' '));
                setTimeout(() => {
                    speechSynthesis.cancel();
                    var utterance = createUtterance(textToSay);
                    utterance.voice = msg.voice;
                    console.log(utterance);
                    speechSynthesis.speak(utterance);                        
                }, 500);
            }
        },
        getVoices: function() {
            return voices;
        },
        getVoice: function() {
            return msg.voice;
        },
        setVoice: function(voiceName) {
            msg.voice = voices.filter(function(voice) { return voice.name == voiceName; })[0];
        }
    }

})(mySpeechObject || {})

function createUtterance(msgTxt) {
    var utter = new SpeechSynthesisUtterance(msgTxt);
    utter.volume = 1;
    utter.pitch = 0;
    utter.rate = 1;
    utter.lang = 'nl';
    // utter.onerror = (e) => {
    //     speechSynthesis.cancel();
    //     console.log('ERROR SPEAKING');
    //     console.log(e);
    // }
    utter.onstart = (e) => {
        console.log('START SPEAKING');
        console.log(e.utterance.text);
    }
    utter.onend = () => {
        console.log('END SPEAKING');
        speechSynthesis.cancel();
    }
    return utter;
}