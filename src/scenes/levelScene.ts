import { Color4, Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { InputManager } from "../inputManager";
import { Player } from "../actors/player";
import { Environment } from "../environments/environment";
import { GameEngine } from "../game";
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

    // set up the level without gui, in the background
    public async setUpLevelAsync(levelToLoad: number): Promise<void> {
        // environment
        switch (levelToLoad) {
            case 1:
                this.environment = new Rush(this, this.player);
                break;

            case 2:
                this.environment = new Bird(this, this.player);
                break;

            default:
                this.environment = new Rush(this, this.player);
                break;
        }
        await this.environment.load();

        // instanciate player
        await this.player.instanciate(this.environment.getLight(), new Vector3(0, 20, 0), new Vector3(0, Math.PI / 2, 0), this.input);
        this.player.activateEntityComponents();

        //shitty switch as player need environement and environement need player
        switch (levelToLoad) {
            case 1:
                this.player.addComponent(new PlayerController(this.player, this.input));
                break;

            case 2:
                this.player.addComponent(new BirdController(this.player, this.input));
                break;

            default:
                this.player.addComponent(new PlayerController(this.player, this.input));
                break;
        }

        this.registerBeforeRender(() => {
            if (this.environment)
                this.environment.beforeRenderUpdate();
        });
    }
}