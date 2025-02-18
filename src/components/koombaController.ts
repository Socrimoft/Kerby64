import { AnimationGroup, Mesh, Ray, Vector3 } from "@babylonjs/core";
import { Anim } from "./anim";
import { LevelScene } from "../scenes/levelScene";
import { EntityController } from "./entityController";
import { GameEntity } from "../actors/gameEntity";

export class KoombaController extends EntityController implements Anim {
    protected linearSpeed = 1;
    idleAnim = undefined;
    walkAnim: AnimationGroup;
    runAnim = undefined;

    constructor(entity: GameEntity, animations: AnimationGroup[], scene: LevelScene) {
        super(entity, scene);
        const walkAnim = animations.find(ag => ag.name.toLowerCase().includes("take 001"));
        if (!walkAnim) {
            throw new Error("Walk animation not found for " + entity.name);
        }
        this.walkAnim = walkAnim;
        this.meshAnimations.push(this.walkAnim);
        this.playAnimation(this.walkAnim);
    }

    beforeRenderUpdate(): void {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

        this.entity.moveWithCollisions(new Vector3(0, this.gravity * deltaTime, 0));

        this.entity.moveForwardWithCollisions(this.linearSpeed * deltaTime);

        // detect if encounters another object
        const ray = new Ray(new Vector3(this.entity.getPosition().x + 2, this.entity.getPosition().y, this.entity.getPosition().z), this.entity.getForward(), 1);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedMesh && !this.entity.isSameMesh(hit.pickedMesh))
            this.entity.setRotation(new Vector3(this.entity.getRotation().x, -this.entity.getRotation().y, this.entity.getRotation().z));
    }
}
