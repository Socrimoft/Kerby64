import { AnimationGroup, Ray, Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { InputManager } from "../inputManager";
import { EntityController } from "./entityController";
import { Anim } from "./anim";
import { Player } from "../actors/player";

export class PlayerController extends EntityController implements Anim {
    private input: InputManager;
    public idleAnim: AnimationGroup;
    public walkAnim: AnimationGroup;
    public runAnim: AnimationGroup;

    constructor(entity: Player, animations: AnimationGroup[], input: InputManager, scene: LevelScene) {
        super(entity);
        const idleAnim = animations.find(ag => ag.name.toLowerCase().includes("idle"));
        const walkAnim = animations.find(ag => ag.name.toLowerCase().includes("walk"));
        const runAnim = animations.find(ag => ag.name.toLowerCase().includes("run"));

        if (!idleAnim) {
            throw new Error("Idle animation not found for " + entity.meshRef.name);
        }
        if (!walkAnim) {
            throw new Error("Walk animation not found for " + entity.meshRef.name);
        }
        if (!runAnim) {
            throw new Error("Run animation not found for " + entity.meshRef.name);
        }

        this.idleAnim = idleAnim;
        this.walkAnim = walkAnim;
        this.runAnim = runAnim;
        this.meshAnimations.push(this.idleAnim, this.walkAnim, this.runAnim)
        this.playAnimation(this.idleAnim);
        this.input = input;
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
                this.entity.moveWithCollisions(new Vector3(0, jumpVelocity * deltaTime, 0));
            else
                this.isJumping = false;
        }
        else
            this.entity.moveWithCollisions(new Vector3(0, this.gravity * deltaTime, 0));

        if (this.input.inputMap[this.input.rightKey]) {
            this.entity.rotation = new Vector3(0, Math.PI / 2, 0);
            //this.updateShaderLightDirection(new Vector3(1, 1, 0));
            this.playAnimation(this.runAnim);
            this.entity.moveWithCollisions(this.entity.getForward().scale(this.linearSpeed * deltaTime));
        }
        else if (this.input.inputMap[this.input.leftKey]) {
            this.entity.rotation = new Vector3(0, -Math.PI / 2, 0);
            //this.updateShaderLightDirection(new Vector3(-1, 1, 0));
            this.playAnimation(this.runAnim);
            this.entity.moveWithCollisions(this.entity.getForward().scale(this.linearSpeed * deltaTime));
        }
        else
            this.playAnimation(this.idleAnim);

        // detect if grounded
        const pos = this.entity.position;
        const ray = new Ray(new Vector3(pos.x, pos.y - 1, pos.z), Vector3.Down(), 1);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedMesh && !this.entity.isSameMesh(hit.pickedMesh))
            this.remainingJumps = 3;
    }
}
