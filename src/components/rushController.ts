import { Engine, Ray, Vector3 } from "@babylonjs/core";
import { InputManager } from "../inputManager";
import { EntityController } from "./entityController";
import { Player } from "../actors/player";
import { Game } from "../game";

export class RushController extends EntityController {
    private input: InputManager;

    private Animation = {
        Idle: "Idle",
        Run: "Run",
        Jump: "Jump",
        Inhale: "Inhale",
        MouthFull: "MouthFull",
        SpitOut: "SpitOut",
        Inflate: "Inflate",
        FlyIdle: "Fly_Idle",
        Fly: "Fly",
        Deflate: "Deflate",
        Fall: "Fall"
    } as const;

    constructor(player: Player, input: InputManager) {
        super(player)
        this.input = input

        this.entity.registerAnimations((Object.values(this.Animation) as string[]));
        this.entity.stopAllAnims();
        this.playAnimation(this.Animation.Idle);
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
            // this.updateShaderLightDirection(new Vector3(1, 1, 0));
            this.playAnimation(this.Animation.Run);
            this.entity.moveForwardWithCollisions(this.linearSpeed * deltaTime);
        }
        else if (this.input.inputMap[this.input.leftKey]) {
            this.entity.rotation = new Vector3(0, -Math.PI / 2, 0);
            // this.updateShaderLightDirection(new Vector3(-1, 1, 0));
            this.playAnimation(this.Animation.Run);
            this.entity.moveForwardWithCollisions(this.linearSpeed * deltaTime);
        }
        else
            this.playAnimation(this.Animation.Idle);

        // detect if grounded // detecte si t puni mdr pas mal ludo
        const ray = new Ray(new Vector3(this.entity.position.x, this.entity.position.y - 1, this.entity.position.z), Vector3.Down(), 1);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedMesh && !this.entity.isSameMesh(hit.pickedMesh))
            this.remainingJumps = 3;
        if (this.entity.position.y < 0) {
            this.entity.dispose();
            Game.Instance.switchToGameOver(this.scene.score)
        }
    }
}
