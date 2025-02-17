import { AnimationGroup, Mesh, Ray, Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { InputManager } from "../inputManager";
import { Component } from "./component";

export class CharacterController implements Component {
    public scene: LevelScene;
    private mesh: Mesh;
    private input: InputManager;

    private linearSpeed: number = 20;
    private gravity: number = -12;
    private jumpSpeed: number = 20;
    private jumpThreshold: number = 8;
    private k: number = 3;


    private jumpStartTime: number = 0;
    private isJumping: boolean = false;
    private remainingJumps: number = 3;

    private idleAnim: AnimationGroup;
    private walkAnim: AnimationGroup;
    private runAnim: AnimationGroup;
    private meshAnimations: Array<AnimationGroup> = [];

    constructor(mesh: Mesh, animations: Array<AnimationGroup>, input: InputManager, scene: LevelScene) {
        this.mesh = mesh;
        this.input = input;
        this.scene = scene;
        const idleAnim = animations.find(ag => ag.name.toLowerCase().includes("idle"));
        const walkAnim = animations.find(ag => ag.name.toLowerCase().includes("walk"));
        const runAnim = animations.find(ag => ag.name.toLowerCase().includes("run"));

        if (!idleAnim) {
            throw new Error("Idle animation not found for " + mesh.name);
        }
        if (!walkAnim) {
            throw new Error("Walk animation not found for " + mesh.name);
        }
        if (!runAnim) {
            throw new Error("Run animation not found for " + mesh.name);
        }

        this.idleAnim = idleAnim;
        this.walkAnim = walkAnim;
        this.runAnim = runAnim;
        this.meshAnimations.push(this.idleAnim);
        this.meshAnimations.push(this.walkAnim);
        this.meshAnimations.push(this.runAnim);
        this.playAnimation(this.idleAnim);
    }

    private playAnimation(anim: AnimationGroup): void {
        if (!anim.isPlaying) {
            this.meshAnimations.forEach(ag => ag.stop());
            anim.play(true);
        }
    }

    public beforeRenderUpdate(): void {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

        if (this.input.inputMap[this.input.jumpKey] && !this.isJumping && this.remainingJumps) {
            this.jumpStartTime = performance.now();
            this.isJumping = true;
            this.remainingJumps--;
        }

        if (this.isJumping && this.jumpStartTime) {
            const elapsedTime = (performance.now() - this.jumpStartTime) / 1000;
            const jumpVelocity = this.jumpSpeed * Math.exp(-this.k * elapsedTime);

            if (jumpVelocity > this.jumpThreshold)
                this.mesh.moveWithCollisions(new Vector3(0, jumpVelocity * deltaTime, 0));
            else
                this.isJumping = false;
        }
        else
            this.mesh.moveWithCollisions(new Vector3(0, this.gravity * deltaTime, 0));

        if (this.input.inputMap[this.input.rightKey]) {
            this.mesh.rotation = new Vector3(0, Math.PI / 2, 0);
            this.playAnimation(this.runAnim);
            this.mesh.moveWithCollisions(this.mesh.forward.scale(this.linearSpeed * deltaTime));
        }
        else if (this.input.inputMap[this.input.leftKey]) {
            this.mesh.rotation = new Vector3(0, -Math.PI / 2, 0);
            this.playAnimation(this.runAnim);
            this.mesh.moveWithCollisions(this.mesh.forward.scale(this.linearSpeed * deltaTime));
        }
        else
            this.playAnimation(this.idleAnim);

        // detect if grounded
        const ray = new Ray(new Vector3(this.mesh.position.x, this.mesh.position.y - 1, this.mesh.position.z), Vector3.Down(), 1);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedMesh && hit.pickedMesh != this.mesh)
            this.remainingJumps = 3;
    }
}
