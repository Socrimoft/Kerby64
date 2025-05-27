import { AudioEngineV2, CreateAudioEngineAsync, CreateSoundAsync, IStaticSoundPlayOptions, StaticSound } from "@babylonjs/core";

/**
 * enum for sound file names.\
 * This enum is used to map sound names to their file names.
 */
enum SoundFileName {
    maintitle = "maintitle.ogg",
    gameselect = "gameselect.flac",
    rush = "rush.flac",
    classicmenu = "classicmenu.flac",
    classic1 = "classic1.flac",
    classic2 = "classic2.flac",
    classic3 = "classic3.flac",
    classic4 = "classic4.flac",
    classic5 = "classic5.flac",
    bird = "bird.flac",
    worldmenu = "worldmenu.flac",
    world = "world.flac",
    cutscene = "cutscene.ogg",
    gameover = "gameover.ogg",
}

type Sounds = keyof typeof SoundFileName;

/**
 * AudioManager class to manage audio in the game.\
 * It initializes the audio engine, loads sounds, and provides methods to play, stop, pause, and resume sounds.
 * @todo fix audio engine blocking game loading
 */
export class AudioManager {
    private readonly root = "/assets/audio/";
    private audioEngine: AudioEngineV2 = null as any;
    private sounds: Map<Sounds, StaticSound> = new Map<Sounds, StaticSound>();

    private readynessPromise: Promise<void>;

    constructor() {
        this.readynessPromise = new Promise<void>((resolve, reject) => {
            CreateAudioEngineAsync({ disableDefaultUI: true }).then((engine) => {
                this.audioEngine = engine;
                console.log("Audio engine created successfully.");
                Promise.allSettled(Object.keys(SoundFileName).map(async (sound) => ([sound, await CreateSoundAsync(sound, this.root + SoundFileName[sound], undefined, engine)] as [Sounds, StaticSound]))).then((results) => {
                    this.sounds = new Map<Sounds, StaticSound>(results.filter(result => result.status === "fulfilled").map(result => result.value));
                    resolve();
                });
            }).catch((error) => {
                reject(error);
            });
        }).catch((error) => {
            console.error("Error creating audio engine:", error);
        });
    }

    public async init() {
        return this.readynessPromise;
    }

    public get Engine(): AudioEngineV2 {
        return this.audioEngine;
    }

    public async play(name: Sounds, options?: Partial<IStaticSoundPlayOptions>) {
        const sound = this.sounds.get(name);
        if (!sound) {
            console.error(`Sound ${name} not found`);
            return;
        }
        if (this.audioEngine.state === "suspended") {
            await this.audioEngine.unlockAsync();
        }
        if (this.audioEngine.state === "running") {
            sound.play(options);
        } else {
            console.error(`Audio engine is not running, cannot play sound ${name}`);
        }

    }

    public async stop(name: Sounds) {
        const sound = this.sounds.get(name);
        if (!sound) {
            console.error(`Sound ${name} not found`);
            return;
        }
        sound.stop();
    }

    public async pause() {
        await this.audioEngine.pauseAsync();
    }

    public async resume() {
        await this.audioEngine.resumeAsync();
    }

    public async unlock() {
        await this.audioEngine.unlockAsync();
    }

    public get state() {
        return this.audioEngine.state;
    }
}
