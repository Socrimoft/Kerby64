import { AnimationGroup, Axis, Mesh, Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { InputManager } from "../inputManager";
import { Component } from "./component";

export class CharacterController implements Component
{
    public scene: LevelScene;
    private mesh: Mesh;
    private input: InputManager;

    private linearSpeed: number = 0.1;
    private jumpSpeed: number = 0.15;
    private gravity: number = -0.06;

    private idleAnim: AnimationGroup;
    private runAnim: AnimationGroup;

    constructor(mesh: Mesh, animations: Array<AnimationGroup>, input: InputManager, scene: LevelScene) {
        this.mesh = mesh;
        this.input = input;
        this.scene = scene;
        console.log(animations);
        this.idleAnim = animations.find(ag => ag.name.toLowerCase().includes("idle"));
        this.runAnim = animations.find(ag => ag.name.toLowerCase().includes("run"));
        this.playIdleAnim();
    }

    public beforeRenderUpdate(): void {
        this.updateFromControls();
    }

    private playIdleAnim(): void {
        if (!this.idleAnim.isPlaying) {
            this.runAnim.stop();
            this.idleAnim.play(true);
        }
    }

    private playRunAnim(): void {
        if (!this.runAnim.isPlaying) {
            this.idleAnim.stop();
            this.runAnim.play(true);
        }
    }

    private updateFromControls(): void {
        // const deltaTime = this.scene.getEngine().getDeltaTime() * this.deltaTimeFactor;
        this.mesh.moveWithCollisions(new Vector3(0, this.gravity, 0));

        if (this.input.inputMap[this.input.jumpKey] && this.mesh.position.y < 15) {
            this.mesh.moveWithCollisions(Axis.Y.scale(this.jumpSpeed));
        }

        if (this.input.inputMap[this.input.rightKey]) {
            this.mesh.rotation = new Vector3(0, Math.PI/2, 0);
            this.playRunAnim();
            this.mesh.moveWithCollisions(this.mesh.forward.scale(this.linearSpeed));
        }
        else if (this.input.inputMap[this.input.leftKey]) {
            this.mesh.rotation = new Vector3(0, -Math.PI/2, 0);
            this.playRunAnim();
            this.mesh.moveWithCollisions(this.mesh.forward.scale(this.linearSpeed));
        }
        else
            this.playIdleAnim();
    }
}
