import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine } from "@babylonjs/core";
import { MainMenuScene } from "./scenes/mainMenuScene";
import { CutSceneScene } from "./scenes/cutSceneScene";
import { LevelScene } from "./scenes/levelScene";

enum State {
    MAINMENU,
    CUTSCENE,
    LEVEL,
    GAMEOVER
}

export class Game {
    private static instance: Game;
    public canvas: HTMLCanvasElement;
    public engine!: Engine
    private mainMenuScene!: MainMenuScene;
    private cutScene!: CutSceneScene;
    private levelScene!: LevelScene;

    private state: State = State.MAINMENU;
    private options = { doNotHandleContextLost: false, audioEngine: true, renderEvenInBackground: true }

    constructor() {
        this.canvas = this.createCanvas();
        // ---------- Only Dev Mode ----------
        window.addEventListener("keydown", (ev) => {
            if (ev.ctrlKey && ev.altKey && ev.key === "i") {
                if (this.CurrentScene!.debugLayer.isVisible()) {
                    this.CurrentScene!.debugLayer.hide();
                }
                else {
                    this.CurrentScene!.debugLayer.show();
                }
            }
        });
        // -----------------------------------

        this.main();
    }

    public static get Instance() {
        return this.instance || (this.instance = new this());
    }

    public get CurrentScene() {
        switch (this.state) {
            case State.MAINMENU:
               return this.mainMenuScene;
            case State.CUTSCENE:
                return this.cutScene;
            case State.LEVEL:
                return this.levelScene;
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

    private async main(): Promise<void> 
    {
        this.engine = new Engine(this.canvas, false, this.options);
        await this.switchToMainMenu();

        this.engine.runRenderLoop(() => {
            this.CurrentScene.render();
        });
        //resize screen
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    public async switchToMainMenu() 
    {
        this.engine.displayLoadingUI();

        this.mainMenuScene = new MainMenuScene(this.engine);
        this.mainMenuScene.load();

        // finish setup
        await this.mainMenuScene.whenReadyAsync();
        this.engine.hideLoadingUI();
        this.state = State.MAINMENU;
    }

    public async switchToCutScene(levelToLoad: number) {
        this.engine.displayLoadingUI();

        this.cutScene = new CutSceneScene(this.engine);
        this.cutScene.load();

        // finish setup
        await this.cutScene.whenReadyAsync();
        this.engine.hideLoadingUI();
        this.state = State.CUTSCENE;

        // setting up during current scene
        this.levelScene = new LevelScene(this.engine);
        await this.levelScene.setUpLevelAsync(levelToLoad);
    }

    public async switchToLevel() {
        this.levelScene.load();

        await this.levelScene.whenReadyAsync();
        this.state = State.LEVEL;
        this.engine.hideLoadingUI();
        this.levelScene.attachControl();
    }
}
Game.Instance;
