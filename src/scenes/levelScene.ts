import { AnimationGroup, Color4, Engine, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { InputManager } from "../inputManager";
import { AssetsLoader } from "../assets/assetsLoader";
import { Player } from "../actors/player";
import { Environment } from "../environments/environment";
import { Rush } from "../environments/minigames/rush";

export class LevelScene extends Scene {
    private player!: Player;
    public input: InputManager;

    public environment!: Environment;

    public score: number = 0;
    public scoreText: TextBlock;

    constructor(engine: Engine) {
        console.log("new level scene");
        super(engine);
        this.input = new InputManager(this);
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
        // instanciate player
        var animations: Array<AnimationGroup> = [];
        const playerRoot = await AssetsLoader.loadCharacterAssets("player", "kerby.glb", animations, this);
        playerRoot.scaling = new Vector3(1, 1, 1);
        playerRoot.position = new Vector3(0, -0.5, 0);
        playerRoot.rotation = new Vector3(3 * Math.PI / 2, 0, 0);

        const playerCollider = MeshBuilder.CreateBox("playerCollider", { width: 1, height: 2, depth: 1 }, this);
        playerCollider.position = new Vector3(0, 20, 0);
        playerCollider.rotation = new Vector3(0, Math.PI / 2, 0);
        playerCollider.isVisible = false;
        playerCollider.checkCollisions = true;

        playerRoot.parent = playerCollider;
        this.player = new Player(playerCollider, animations, this, this.input);

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

        this.player.activatePlayerComponents();

        this.registerBeforeRender(() => {
            this.environment.beforeRenderUpdate();
        });
    }
}
