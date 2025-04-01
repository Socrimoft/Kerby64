import { InputManager } from "../inputManager";
import { LevelScene } from "../scenes/levelScene";
import { Camera2DController } from "../components/camera2DController";
import { GameEntity } from "./gameEntity";
import { Component } from "../components/component";
import { DirectionalLight, Vector3 } from "@babylonjs/core";
import { EntityController } from "../components/entityController";
import { RushController } from "../components/rushController";
import { BirdController } from "../components/birdController";
import { Camera3DController } from "../components/camera3DController";

export type CameraController = Camera2DController | Camera3DController
export class Player extends GameEntity {
    private entityController?: EntityController;
    private cameraController?: CameraController;

    static Animation = {
        Idle: "Idle",
        Run: "Run",
        Jump: "Jump",
        Inhale: "Inhale",
        MouthFull: "MouthFull",
        SpitOut: "SpitOut",
        Inflate: "Inflate",
        FlyIdle: "Fly_Idle",
        Fly: "Fly",
        Deflate: "Deflate",
        Fall: "Fall"
    } as const;

    constructor(scene: LevelScene, ...components: Component[]) {
        super("kerby", scene, ...components)
        components.forEach((comp) => {
            if (comp instanceof RushController || comp instanceof BirdController) {
                this.entityController = comp;
            }
        });
    }

    public async instanciate(light: DirectionalLight, position: Vector3, rotation: Vector3, input?: InputManager,
        cameraclass: new (player: Player, input: InputManager) => CameraController = Camera2DController): Promise<void> {
        await super.instanciate(light, position, rotation);
        if (!this.mesh)
            throw new Error("Error while instanciating the GameEntity " + this.name);
        if (!input)
            throw new Error("no InputManager for GameEntity" + this.name);
        this.mesh.scaling = new Vector3(2.5, 2.5, 2.5);

        this.cameraController = new cameraclass(this, input);

        this.addComponent(this.cameraController);

        this.registerAnimations((Object.values(Player.Animation) as string[]));
    }
}
