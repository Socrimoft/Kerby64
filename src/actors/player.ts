import { InputManager } from "../inputManager";
import { LevelScene } from "../scenes/levelScene";
import { PlayerController } from "../components/playerController";
import { PlayerCamera } from "../components/playerCamera";
import { GameEntity } from "./gameEntity";

export class Player extends GameEntity {
    private entityController?: PlayerController;
    private cameraController?: PlayerCamera;

    public activatePlayerComponents(scene: LevelScene, input: InputManager): void {
        this.entityController = new PlayerController(this.mesh, this.animations, input, scene);
        this.cameraController = new PlayerCamera(this.mesh, scene);
        this.components.push(this.entityController, this.cameraController);

        this.scene.registerBeforeRender(() => {
            this.components.forEach((comp) => {
                comp.beforeRenderUpdate();
            });
        });
    }
}
