import { Color4, FreeCamera, Scene, Vector3 } from "@babylonjs/core";
import { Control } from "@babylonjs/gui";
import { Menu } from "../gui/menu";
import { GameEngine } from "../game";

export class GameOverScene extends Scene {
    constructor(engine: GameEngine) {
        super(engine);
    }

    public async load(score?: number) {
        this.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this);
        camera.setTarget(Vector3.Zero());

        this.createGameOverMenu(score);
    }

    private createGameOverMenu(score?: number): void {
        const guiMenu = new Menu("gameOverMenu", 720);

        guiMenu.addTextBlock("title", "Game Over", 50, "red", "-30%", Control.VERTICAL_ALIGNMENT_CENTER, Control.HORIZONTAL_ALIGNMENT_CENTER);
        if (score != undefined) {
            console.log(score)
            guiMenu.addTextBlock("score", "Score: " + score, score + 10, "white", "-10%", Control.VERTICAL_ALIGNMENT_CENTER, Control.HORIZONTAL_ALIGNMENT_CENTER);
        }
        guiMenu.addSimpleButton("retry", "retry", "10%", "10%", undefined, "green", "-20%", undefined, 1, undefined, undefined, undefined, () => { window.location.reload() });

        guiMenu.addSimpleButton("goback", "Title screen", "10%", "10%", undefined, "green", "-10%", undefined, 1, undefined, undefined, undefined, () => { window.location.href = window.location.origin + window.location.pathname });
    }
}

