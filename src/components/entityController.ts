import { AnimationGroup } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Component } from "./component";
import { GameEntity } from "../actors/gameEntity";

export abstract class EntityController implements Component {
    public scene: LevelScene;
    protected entity: GameEntity;

    protected linearSpeed: number = 20;
    protected gravity: number = -12;
    protected jumpSpeed: number = 20;
    protected jumpThreshold: number = 8;
    protected k: number = 3;


    protected jumpStartTime: number = 0;
    protected isJumping: boolean = false;
    protected remainingJumps: number = 3;
    protected meshAnimations: Array<AnimationGroup> = [];

    constructor(entity: GameEntity) {
        this.entity = entity;
        this.scene = entity.scene;
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

    abstract beforeRenderUpdate(): void;
}
