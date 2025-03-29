import { AnimationGroup, Vector3 } from "@babylonjs/core";
import { Anim } from "./anim";
import { EntityController } from "./entityController";
import { GameEntity } from "../actors/gameEntity";

export class KoombaController extends EntityController implements Anim {
    protected linearSpeed = 1;
    private oldPosX?: number;
    idleAnim = undefined;
    walkAnim: AnimationGroup;
    runAnim = undefined;

    constructor(entity: GameEntity) {
        super(entity);
        const walkAnim = entity.animations.find(ag => ag.name.toLowerCase().includes("take 001"));
        if (!walkAnim) {
            throw new Error("Walk animation not found for " + entity.name);
        }
        this.walkAnim = walkAnim;
        this.meshAnimations.push(this.walkAnim);
        this.playAnimation(this.walkAnim);
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
