import { InputManager } from "../inputManager";
import { LevelScene } from "../scenes/levelScene";
import { PlayerCamera } from "../components/playerCamera";
import { GameEntity } from "./gameEntity";
import { Component } from "../components/component";
import { DirectionalLight, Vector3 } from "@babylonjs/core";
import { EntityController } from "../components/entityController";
import { RushController } from "../components/rushController";
import { BirdController } from "../components/birdController";

export class Player extends GameEntity {
    private entityController?: EntityController;
    private cameraController?: PlayerCamera;

    constructor(scene: LevelScene, ...components: Component[]) {
        super("kerby", scene, ...components)
        components.forEach((comp) => {
            if (comp instanceof RushController || comp instanceof BirdController) {
                this.entityController = comp;
            }
        });
    }

    public async instanciate(light: DirectionalLight, position?: Vector3, rotation?: Vector3, input?: InputManager): Promise<void> {
        await super.instanciate(light, position, rotation);
        if (!this.mesh)
            throw new Error("Error while instanciating the GameEntity " + this.name);

        this.mesh.scaling = new Vector3(0.01, 0.01, 0.01);

        this.cameraController = new PlayerCamera(this);

        this.addComponent(this.cameraController);
    }
}
