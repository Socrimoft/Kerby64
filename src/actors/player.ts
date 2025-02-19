import { InputManager } from "../inputManager";
import { LevelScene } from "../scenes/levelScene";
import { PlayerController } from "../components/playerController";
import { PlayerCamera } from "../components/playerCamera";
import { GameEntity } from "./gameEntity";
import { Component } from "../components/component";
import { DirectionalLight, Vector3 } from "@babylonjs/core";

export class Player extends GameEntity {
    private entityController?: PlayerController;
    private cameraController?: PlayerCamera;

    constructor(scene: LevelScene, ...components: Component[]) {
        super("kerby", scene, ...components)
    }

    public async instanciate(light: DirectionalLight, position?: Vector3, rotation?: Vector3, input?: InputManager): Promise<void> {
        await super.instanciate(light, position, rotation);
        if (!this.mesh)
            throw new Error("Error while instanciating the GameEntity " + this.name);

        this.mesh.scaling = new Vector3(0.01, 0.01, 0.01);

        if (input) {
            this.entityController = new PlayerController(this, input);
            this.addComponent(this.entityController);
        }
        this.cameraController = new PlayerCamera(this);

        this.addComponent(this.cameraController);
    }
}
