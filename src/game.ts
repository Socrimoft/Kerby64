import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, ShaderStore, WebGPUEngine } from "@babylonjs/core";
import { MainMenuScene } from "./scenes/mainMenuScene";
import { CutSceneScene } from "./scenes/cutSceneScene";
import { LevelScene } from "./scenes/levelScene";
import { GameOverScene } from "./scenes/gameOverScene";
import toonVertexShader from "./shaders/toon/vertex.wgsl";
import toonFragmentShader from "./shaders/toon/fragment.wgsl";
import { KerbyLoadingScreen } from "./loadingScreen";

enum State {
    MAINMENU,
    CUTSCENE,
    LEVEL,
    GAMEOVER
}
export type GameEngine = Engine | WebGPUEngine

const allowWebGPU = true;

export class Game {
    private static instance: Game;
    public canvas: HTMLCanvasElement;
    public engine: GameEngine
    private mainMenuScene!: MainMenuScene;
    private cutScene!: CutSceneScene;
    private levelScene!: LevelScene;
    private gameOverScene!: GameOverScene;

    private state: State = State.MAINMENU;
    private options = { doNotHandleContextLost: false, audioEngine: true, renderEvenInBackground: true }

    constructor() {
        this.canvas = this.createCanvas();
        this.engine = this.createEngine();
        this.engine.loadingScreen = new KerbyLoadingScreen("");
        if (process.env.NODE_ENV === "development") {
            this.engine.enableOfflineSupport = false;
            window.addEventListener("keydown", (ev) => {
                if (ev.ctrlKey && ev.altKey && ev.key === "i") {
                    if (this.CurrentScene.debugLayer.isVisible()) {
                        this.CurrentScene.debugLayer.hide();
                    } else {
                        this.CurrentScene.debugLayer.show();
                    }
                }
            });
        }

        // load shaders
        ShaderStore.ShadersStoreWGSL["toonVertexShader"] = toonVertexShader;
        ShaderStore.ShadersStoreWGSL["toonFragmentShader"] = toonFragmentShader;
        // Animation.AllowMatricesInterpolation = true;

        this.main();
    }
    public static get urlParams() {
        return new URLSearchParams(window.location.search);
    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    public get CurrentScene() {
        switch (this.state) {
            case State.CUTSCENE:
                return this.cutScene;
            case State.LEVEL:
                return this.levelScene;
            case State.GAMEOVER:
                return this.gameOverScene;
            default:
                return this.mainMenuScene;
        }
    }

    private createCanvas(): HTMLCanvasElement {
        document.documentElement.style["overflow"] = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.width = "100%";
        document.documentElement.style.height = "100%";
        document.documentElement.style.margin = "0";
        document.documentElement.style.padding = "0";
        document.body.style.overflow = "hidden";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.margin = "0";
        document.body.style.padding = "0";

        this.canvas = document.createElement("canvas");
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.canvas.id = "gameCanvas";
        document.body.appendChild(this.canvas);

        return this.canvas;
    }
    private createEngine(): GameEngine {
        if (allowWebGPU && navigator.gpu) { // should be the synchronous variant of "await WebGPUEngine.IsSupportedAsync"
            return new WebGPUEngine(this.canvas, this.options);
        } else {
            return new Engine(this.canvas, false, this.options);
        }
    }

    private async main(): Promise<void> {
        if (this.engine instanceof WebGPUEngine) {
            this.engine.compatibilityMode = true; // false breaks level scenes
            await this.engine.initAsync();
        }
        let level = Game.urlParams.get("game");
        if (level)
            await this.switchToCutScene(level);
        else
            await this.switchToMainMenu();

        this.engine.runRenderLoop(() => {
            this.CurrentScene.render();
        });
        //resize screen
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    public async switchToMainMenu() {
        this.engine.displayLoadingUI();

        this.mainMenuScene = new MainMenuScene(this.engine);
        this.mainMenuScene.load();

        // finish setup
        await this.mainMenuScene.whenReadyAsync();
        this.engine.hideLoadingUI();
        this.state = State.MAINMENU;
    }

    public async switchToCutScene(levelToLoad: number | string, classicLevel?: number, seed?: number) {
        const isWorld = levelToLoad == "world" || levelToLoad == 3
        if (!isWorld) {
            this.engine.displayLoadingUI();

            this.cutScene = new CutSceneScene(this.engine);
            this.cutScene.load(levelToLoad);

            // finish setup
            await this.cutScene.whenReadyAsync();
            this.engine.hideLoadingUI();
            this.state = State.CUTSCENE;
        }
        // setting up during current scene
        this.levelScene = new LevelScene(this.engine);
        await this.levelScene.setUpLevelAsync(levelToLoad, classicLevel, seed);
        if (isWorld) await this.switchToLevel();
    }

    public async switchToLevel() {
        this.levelScene.load();

        await this.levelScene.whenReadyAsync();
        this.state = State.LEVEL;
        this.engine.hideLoadingUI();
        this.levelScene.attachControl();
    }

    public async switchToGameOver(score?: number) {
        this.gameOverScene = new GameOverScene(this.engine);
        this.gameOverScene.load(score);

        await this.gameOverScene.whenReadyAsync();
        this.state = State.GAMEOVER;
        this.engine.hideLoadingUI();
    }
}
Game.Instance;
