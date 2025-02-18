import { InputManager } from "../inputManager";
import { LevelScene } from "../scenes/levelScene";
import { PlayerController } from "../components/playerController";
import { PlayerCamera } from "../components/playerCamera";
import { GameEntity } from "./gameEntity";
import { Component } from "../components/component";

export class Player extends GameEntity {
    private entityController?: PlayerController;
    private cameraController?: PlayerCamera;

    constructor(scene: LevelScene, ...components: Component[]) {
        super("kerby", scene, ...components)
    }

    public activatePlayerComponents(input: InputManager): void {
        this.entityController = new PlayerController(this.mesh, this.animations, input, this.scene);
        this.cameraController = new PlayerCamera(this.mesh, this.scene);
        this.components.push(this.entityController, this.cameraController);

        super.activateEntityComponents()
    }
}
