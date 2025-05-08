import { Color4, Logger, Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { InputManager } from "../inputManager";
import { Player } from "../actors/player";
import { Environment } from "../environments/environment";
import { GameEngine } from "../game";
import { Bird } from "../environments/minigames/bird";
import { Rush } from "../environments/minigames/rush";
import { BirdController } from "../components/birdController";
import { RushController } from "../components/rushController";
import { World } from "../environments/minigames/world";
import { WorldController } from "../components/worldController";
import { Classic } from "../environments/minigames/classic";
import { ClassicController } from "../components/classicController";

enum loadableGame {
    rush = 1,
    bird = 2,
    world = 3,
    classic = 4
}
enum classicLoadableLevel {
    classic = 0,
    kircity = 1,
    kirbros = 2,
    kirbykawaii = 3,
    kirdoom = 4
}
enum worldType {
    flat = 1,
    normal = 2
}
export class LevelScene extends Scene {
    private player: Player;
    public input: InputManager;

    public environment?: Environment;

    public score: number = 0;
    public scoreText: TextBlock;

    constructor(engine: GameEngine) {
        super(engine);
        this.input = new InputManager(this);
        this.player = new Player(this);
        this.clearColor = new Color4(0.8, 0.9, 1, 1);
        this.scoreText = new TextBlock("score");
    }

    public async load() {
        //GUI
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.scoreText.color = "white";
        this.scoreText.fontSize = 25;
        this.scoreText.top = "-45%";
        this.scoreText.left = "-45%";
        playerUI.addControl(this.scoreText);
    }

    public updateScore(value: number) {
        this.score += value;
        this.scoreText.text = "Score : " + this.score;
    }
    public updateNavigatorHistory(data?: { [key: string]: string }) {
        const params = new URLSearchParams(data)
        window.history.pushState(data, "", "?" + params.toString())
    }

    private static isGametoLoadValid(gameToLoad: any): gameToLoad is loadableGame {
        return typeof gameToLoad === "number" && Object.values(loadableGame).includes(gameToLoad);
    }
    private static isClassicLevelValid(classicLevel: any): classicLevel is classicLoadableLevel {
        return typeof classicLevel === "number" && Object.values(classicLoadableLevel).includes(classicLevel);
    }
    private static isWorldTypeValid(worldtype: any): worldtype is worldType {
        return typeof worldtype === "number" && Object.values(worldType).includes(worldtype);
    }
    // set up the game without gui, in the background
    public async setUpLevelAsync(gameToLoad: number | string, classicLevel?: number | string, _seed?: number): Promise<void> {
        // environment
        Logger.Log(["Loading game: " + gameToLoad, _seed != undefined ? ("with seed: " + _seed) : ""]);
        if (typeof gameToLoad === "string") {
            gameToLoad = Object.values(loadableGame).indexOf(gameToLoad.toLowerCase()) + 1;
        }
        if (!LevelScene.isGametoLoadValid(gameToLoad)) {
            gameToLoad = loadableGame.rush;
        }
        if (!_seed && gameToLoad !== loadableGame.world) _seed = undefined;
        const playerpos = new Vector3(0, 20, 0);
        const playerrot = new Vector3(0, Math.PI / 2, 0);

        switch (gameToLoad) {
            case loadableGame.bird:
                this.environment = new Bird(this, this.player, _seed);
                await this.environment.load();
                this.updateNavigatorHistory({ game: "bird", seed: this.environment.seed.toString() });
                await this.player.instanciate(playerpos, playerrot, this.input);
                this.player.addComponent(new BirdController(this.player, this.input));
                break;

            case loadableGame.world:
                if (typeof classicLevel === "string") {
                    classicLevel = Object.values(worldType).indexOf(classicLevel.toLowerCase()) + 1;
                }
                if (!LevelScene.isWorldTypeValid(classicLevel)) {
                    classicLevel = worldType.flat;
                }
                const worldTypeName = Object.values(worldType)[classicLevel - 1] as string;
                this.environment = new World(this, this.player, _seed);
                Logger.Log("loadEnvironment: " + worldTypeName);
                await this.player.instanciate(playerpos, playerrot, this.input, false);
                await this.environment.load(classicLevel); // classicLevel is the world type (flat or normal)
                this.updateNavigatorHistory({ game: "world", worldtype: worldTypeName, seed: this.environment.seed.toString() });
                const controller = new WorldController(this.player, this.input);
                controller.setupGUI();
                this.player.addComponent(controller);
                break;

            case loadableGame.classic:
                if (typeof classicLevel === "string") {
                    classicLevel = Object.values(classicLoadableLevel).indexOf(classicLevel.toLowerCase())
                };
                if (!LevelScene.isClassicLevelValid(classicLevel)) {
                    classicLevel = classicLoadableLevel.classic;
                }
                const classicLevelName = Object.values(classicLoadableLevel)[classicLevel] as string;
                this.environment = new Classic(this, this.player, _seed);
                Logger.Log("Loading classic level: " + classicLevelName);
                await this.environment.load(classicLevel);
                this.updateNavigatorHistory({ game: "classic", seed: this.environment.seed.toString(), classic: classicLevelName });
                await this.player.instanciate(playerpos, playerrot, this.input);
                this.player.addComponent(new ClassicController(this.player, this.input));
                break;

            default:
                this.environment = new Rush(this, this.player, _seed);
                await this.environment.load();
                this.updateNavigatorHistory({ game: "rush", seed: this.environment.seed.toString() });
                await this.player.instanciate(playerpos, playerrot, this.input);
                this.player.addComponent(new RushController(this.player, this.input));
                break;
        };

        this.player.activateEntityComponents();

        this.environment.setupShadows();

        this.registerBeforeRender(() => {
            this.environment!.beforeRenderUpdate();
        });
    }
}
