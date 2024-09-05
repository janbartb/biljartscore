export class Config {
    maxBeurten: number = 60;
    bepaalTeSpelenCar: ConfigBepaalTeSpelenCar = new ConfigBepaalTeSpelenCar();
    playSounds: boolean = true;
    speech: boolean = true;
    voiceName: String = '';
}

export class ConfigBepaalTeSpelenCar {
    obvMoyenneTabellen: boolean = true;
    obvAantalBeurten: number = 50;
}
