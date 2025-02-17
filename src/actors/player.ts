import { AnimationGroup, Mesh } from "@babylonjs/core";
import { InputManager } from "../inputManager";
import { LevelScene } from "../scenes/levelScene";
import { PlayerController } from "../components/playerController";
import { PlayerCamera } from "../components/playerCamera";
import { GameEntity } from "./gameEntity";

export class Player extends GameEntity {
    public entityController: PlayerController;
    public cameraController: PlayerCamera;

    constructor(mesh: Mesh, animations: Array<AnimationGroup>, scene: LevelScene, input: InputManager) {
        super(mesh, scene)
        this.entityController = new PlayerController(mesh, animations, input, scene)
        this.cameraController = new PlayerCamera(mesh, scene);
        this.components.push(this.entityController, this.cameraController);
    }

    public activatePlayerComponents(): void {
        this.scene.registerBeforeRender(() => {
            this.components.forEach((comp) => {
                comp.beforeRenderUpdate();
            });
        });
    }
}
