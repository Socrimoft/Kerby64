import { Color4, Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { InputManager } from "../inputManager";
import { Player } from "../actors/player";
import { Environment } from "../environments/environment";
import { Game, GameEngine } from "../game";
import { Bird } from "../environments/minigames/bird";
import { Rush } from "../environments/minigames/rush";
import { BirdController } from "../components/birdController";
import { PlayerController } from "../components/playerController";

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

    // set up the level without gui, in the background
    public async setUpLevelAsync(levelToLoad: number | string): Promise<void> {
        // environment
        const levels = ["rush", "bird"];
        if (typeof levelToLoad === "string") {
            levelToLoad = levels.indexOf((levelToLoad as string).toLowerCase()) + 1 || 1;
        }
        const environments = [Rush, Bird];
        const controllers = [PlayerController, BirdController];
        this.environment = new (environments.at(levelToLoad - 1) || environments[0])(this, this.player);
        await this.environment.load();
        const level = levels.at(levelToLoad - 1) || levels[0];
        const seed = this.environment.seed.toString();
        this.updateNavigatorHistory({ level, seed })

        // instanciate player
        await this.player.instanciate(this.environment.getLight(), new Vector3(0, 20, 0), new Vector3(0, Math.PI / 2, 0), this.input);
        this.player.activateEntityComponents();

        this.player.addComponent(new (controllers.at(levelToLoad - 1) || controllers[0])(this.player, this.input));

        this.registerBeforeRender(() => {
            this.environment?.beforeRenderUpdate();
        });
    }
}