import { AnimationGroup, Mesh } from "@babylonjs/core";
import { InputManager } from "../inputManager";
import { LevelScene } from "../scenes/levelScene";
import { CharacterController } from "../components/characterController";
import { PlayerCamera } from "../components/playerCamera";
import { Component } from "../components/component";

export class Player
{
    public scene: LevelScene;
    public mesh: Mesh;
    public characterController: CharacterController;
    public cameraController: PlayerCamera;
    public components: Component[] = [];

    constructor(mesh: Mesh, animations: Array<AnimationGroup>, scene: LevelScene, input: InputManager) {
        this.scene = scene;
        this.mesh = mesh;
        this.characterController = new CharacterController(this.mesh, animations, input, scene);
        this.components.push(this.characterController);
        this.cameraController = new PlayerCamera(this.mesh, this.scene);
        this.components.push(this.cameraController);
    }

    public activatePlayerComponents(): void {
        this.scene.registerBeforeRender(() => {
            this.components.forEach((comp) => {
                comp.beforeRenderUpdate();
            });
        });
    }
}
