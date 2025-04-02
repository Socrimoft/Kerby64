import { Color4, Scene, Vector3 } from "@babylonjs/core";
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
import { Camera3DController } from "../components/camera3DController";

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

    // set up the game without gui, in the background
    public async setUpLevelAsync(gameToLoad: number | string, classicLevel?: number): Promise<void> {
        // environment
        const games = ["rush", "bird", "world", "classic"];
        if (typeof gameToLoad === "string")
            gameToLoad = games.indexOf((gameToLoad as string).toLowerCase()) + 1 || 1;
        const environments = [Rush, Bird, World, Classic];
        const controllers = [RushController, BirdController, WorldController, ClassicController];
        this.environment = new (environments.at(gameToLoad - 1) || environments[0])(this, this.player);
        const game = games.at(gameToLoad - 1) || games[0];
        await this.environment.load(game === "classic" ? classicLevel : undefined);
        const seed = this.environment.seed.toString();
        const level = classicLevel?.toString() as string;
        this.updateNavigatorHistory(game === "classic" ? { game, seed, level } : { game, seed })

        // instanciate player
        await this.player.instanciate(new Vector3(0, 20, 0), new Vector3(0, Math.PI / 2, 0), this.input, gameToLoad == 3 ? Camera3DController : undefined);
        this.player.addComponent(new (controllers.at(gameToLoad - 1) || controllers[0])(this.player, this.input));
        this.player.activateEntityComponents();

        this.registerBeforeRender(() => {
            this.environment?.beforeRenderUpdate();
        });
    }
}
