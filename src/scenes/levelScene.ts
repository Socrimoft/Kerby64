import { Color4, Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { InputManager } from "../inputManager";
import { Player } from "../actors/player";
import { Environment } from "../environments/environment";
import { Rush } from "../environments/minigames/rush";
import { GameEngine } from "../game";

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
        this.scoreText = new TextBlock("score", "Score : 0");
    }

    public async load() {
        //GUI
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.scoreText.color = "black";
        this.scoreText.fontSize = 25;
        this.scoreText.top = "-45%";
        this.scoreText.left = "-45%";
        playerUI.addControl(this.scoreText);
    }

    // set up the level without gui, in the background
    public async setUpLevelAsync(levelToLoad: number): Promise<void> {
        // environment
        switch (levelToLoad) {
            case 1:
                this.environment = new Rush(this, this.player);
                break;
            default:
                this.environment = new Rush(this, this.player);
                break;
        }
        await this.environment.load();

        // instanciate player
        await this.player.instanciate(this.environment.getLight(), new Vector3(0, 20, 0), new Vector3(0, Math.PI / 2, 0), this.input);
        this.player.activateEntityComponents();

        this.registerBeforeRender(() => {
            if (this.environment)
                this.environment.beforeRenderUpdate();
        });
    }
}
