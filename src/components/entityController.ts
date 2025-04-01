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

    constructor(entity: GameEntity) {
        this.entity = entity;
        this.scene = entity.scene;
    }

    protected playAnimation(name: string, loop: boolean = true): void {
        const anim = this.entity.getAnimByName(name);
        if (!anim.isPlaying) {
            this.entity.stopAllAnims();
            anim.play(loop);
        }
    }

    abstract beforeRenderUpdate(): void;
}
