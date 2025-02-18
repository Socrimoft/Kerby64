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
    protected meshAnimations: AnimationGroup[] = [];

    constructor(mesh: Mesh, scene: LevelScene) {
        this.mesh = mesh;
        this.scene = scene;
    }
    protected playAnimation(anim?: AnimationGroup): void {
        if (anim && !anim.isPlaying) {
            this.meshAnimations.forEach(ag => ag.stop());
            anim.play(true);
        }
    }
    protected playAnimationByName(name: string): void {
        this.playAnimation(this.meshAnimations.find((anim) => anim.name.toLowerCase().includes(name)))
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
