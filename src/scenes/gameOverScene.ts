import { Color4, Engine, FreeCamera, Scene, Vector3 } from "@babylonjs/core";
import { Control } from "@babylonjs/gui";
import { Menu } from "../gui/menu";
import { GameEngine } from "../game";

export class GameOverScene extends Scene {
    constructor(engine: GameEngine) {
        super(engine);
    }

    public async load() {
        this.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this);
        camera.setTarget(Vector3.Zero());

        this.createGameOverMenu();
    }

    private createGameOverMenu(): void {
        const guiMenu = new Menu("gameOverMenu", 720);

        guiMenu.addTextBlock("title", "Game Over", 50, "red", "-30%", Control.VERTICAL_ALIGNMENT_CENTER, Control.HORIZONTAL_ALIGNMENT_CENTER);
    }
}

