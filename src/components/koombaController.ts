import { AnimationGroup, Vector3 } from "@babylonjs/core";
import { EntityController } from "./entityController";
import { GameEntity } from "../actors/gameEntity";

export class KoombaController extends EntityController {
    protected linearSpeed = 1;
    private oldPosX?: number;

    private Animation = {
        Walk: "Take 001"
    } as const;

    constructor(entity: GameEntity) {
        super(entity);

        this.entity.registerAnimations((Object.values(this.Animation) as string[]));
        this.playAnimation(this.Animation.Walk);
    }

    beforeRenderUpdate(): void {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        this.entity.moveForwardWithCollisions(this.linearSpeed * deltaTime);
        this.entity.moveWithCollisions(new Vector3(0, this.gravity * deltaTime, 0));
        if (this.oldPosX == this.entity.position.x)
            this.entity.rotation = new Vector3(0, -this.entity.rotation.y, 0);
        this.oldPosX = this.entity.position.x;
        if (this.entity.position.y < 0)
            this.entity.dispose();
    }
}
