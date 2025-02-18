import { AnimationGroup, Mesh, ShaderMaterial, Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Component } from "./component";

export abstract class EntityController implements Component {
    public scene: LevelScene;
    protected mesh: Mesh;

    protected linearSpeed: number = 20;
    protected gravity: number = -12;
    protected jumpSpeed: number = 20;
    protected jumpThreshold: number = 8;
    protected k: number = 3;


    protected jumpStartTime: number = 0;
    protected isJumping: boolean = false;
    protected remainingJumps: number = 3;

    protected idleAnim: AnimationGroup;
    protected walkAnim: AnimationGroup;
    protected runAnim: AnimationGroup;
    protected meshAnimations: Array<AnimationGroup> = [];

    constructor(mesh: Mesh, animations: Array<AnimationGroup>, scene: LevelScene) {
        this.mesh = mesh;
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

    protected playAnimation(anim: AnimationGroup): void {
        if (!anim.isPlaying) {
            this.meshAnimations.forEach(ag => ag.stop());
            anim.play(true);
        }
    }

    protected updateShaderLightDirection(direction: Vector3) {
        this.mesh.getChildMeshes().forEach(mesh => {
            if (mesh.material && mesh.material instanceof ShaderMaterial) {
                mesh.material.setVector3("lightDir", direction);
            }
        });
    }

    abstract beforeRenderUpdate(): void;
}
