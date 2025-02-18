import { Color4, FreeCamera, Scene, Vector3 } from "@babylonjs/core";
import { Control } from "@babylonjs/gui";
import { Game, GameEngine } from "../game";
import { Menu } from "../gui/menu";

export class CutSceneScene extends Scene {
    constructor(engine: GameEngine) {
        super(engine);
    }

    public async load() {
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this);
        camera.setTarget(Vector3.Zero());
        this.clearColor = new Color4(0, 0, 0, 1);

        // GUI
        const cutScene = new Menu("cutscene", 720);
        cutScene.addSimpleButton("next", "Next", "100px", "40px", "rgb(124,252,0)", "black", "-20px", "-60px", 10, 0, Control.VERTICAL_ALIGNMENT_BOTTOM, Control.HORIZONTAL_ALIGNMENT_RIGHT, () => {
            this.detachControl();
            Game.Instance.switchToLevel();
            this.dispose();
        });
    }
}
