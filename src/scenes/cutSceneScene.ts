import { Color4, FreeCamera, Scene, Vector3 } from "@babylonjs/core";
import { Control } from "@babylonjs/gui";
import { Game, GameEngine } from "../game";
import { Menu } from "../gui/menu";

export class CutSceneScene extends Scene {
    constructor(engine: GameEngine) {
        super(engine);
    }

    public async load(game: number | string) {
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), this);
        camera.setTarget(Vector3.Zero());
        this.clearColor = new Color4(0, 0, 0, 1);
        // GUI
        Game.Instance.audio.play("cutscene", { loop: true });
        const cutScene = new Menu("cutscene", 720);
        cutScene.ui.onDisposeObservable.add(() => { Game.Instance.audio.stop("cutscene") });
        if (typeof game === "string") game = game.toLowerCase();
        switch (game) {
            case 2:
            case "bird":
                cutScene.addBackground("cutscene", "assets/images/cutscene/kirbybirdTrasition.png");
                cutScene.addSimpleButton("next", "Next", "100px", "40px", "rgb(124,252,0)", "black", "-20px", "-60px", 10, 0,
                    Control.VERTICAL_ALIGNMENT_BOTTOM, Control.HORIZONTAL_ALIGNMENT_RIGHT, this.exitCutScene.bind(this));
                break;
            case 3:
            case "world":
                return this.exitCutScene();
            //cutScene.addSimpleButton("next", "Next", "100px", "40px", "rgb(124,252,0)", "black", "-20px", "-60px", 10, 0,
            //    Control.VERTICAL_ALIGNMENT_BOTTOM, Control.HORIZONTAL_ALIGNMENT_RIGHT, this.exitCutScene.bind(this));
            //break;
            case 4:
            case "classic":
                cutScene.addSimpleButton("next", "Next", "100px", "40px", "rgb(124,252,0)", "black", "-20px", "-60px", 10, 0,
                    Control.VERTICAL_ALIGNMENT_BOTTOM, Control.HORIZONTAL_ALIGNMENT_RIGHT, this.exitCutScene.bind(this));
                break;
            default: // rush
                cutScene.addSimpleButton("next", "Next", "100px", "40px", "rgb(124,252,0)", "black", "-20px", "-60px", 10, 0,
                    Control.VERTICAL_ALIGNMENT_BOTTOM, Control.HORIZONTAL_ALIGNMENT_RIGHT, this.exitCutScene.bind(this));
        }

    }

    private exitCutScene() {
        this.detachControl();
        Game.Instance.switchToLevel();
        this.dispose();
    }
}
