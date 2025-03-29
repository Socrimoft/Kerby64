import { AnimationGroup, Nullable, Ray, Vector3 } from "@babylonjs/core";
import { InputManager } from "../inputManager";
import { EntityController } from "./entityController";
import { Anim } from "./anim";
import { Player } from "../actors/player";
import { Block } from "../world/block";

export class WorldController extends EntityController implements Anim {
    private input: InputManager;
    public idleAnim: AnimationGroup;
    public walkAnim: AnimationGroup;
    public runAnim: AnimationGroup;
    private mouseSensibilityX = 0.001;
    private mouseSensibilityY = 0.001;
    private blockPickRange = 4; // 
    private blockPicked: Nullable<Block> = null;
    protected remainingJumps = 0;   // not used
    protected linearSpeed = 10;     // ?blocks/s

    constructor(player: Player, input: InputManager) {
        super(player)

        this.input = input;
        const idleAnim = player.animations.find(ag => ag.name.toLowerCase().includes("idle"));
        const walkAnim = player.animations.find(ag => ag.name.toLowerCase().includes("walk"));
        const runAnim = player.animations.find(ag => ag.name.toLowerCase().includes("run"));

        if (!idleAnim) {
            throw new Error("Idle animation not found for " + player.name);
        }
        if (!walkAnim) {
            throw new Error("Walk animation not found for " + player.name);
        }
        if (!runAnim) {
            throw new Error("Run animation not found for " + player.name);
        }

        this.idleAnim = idleAnim;
        this.walkAnim = walkAnim;
        this.runAnim = runAnim;
        this.meshAnimations.push(this.idleAnim, this.walkAnim, this.runAnim)
        this.playAnimation(this.idleAnim);
        input.isWorldPlaying = true;
    }

    private moveBeforeUpdate(deltaTime: number) {
        const movUpDown = +this.input.inputMap[this.input.upKey] - +this.input.inputMap[this.input.downKey]
        const movLeftRight = +this.input.inputMap[this.input.leftKey] - +this.input.inputMap[this.input.rightKey]
        const isRunning = this.input.inputMap[this.input.shiftKey]
        const displacement = this.linearSpeed * deltaTime * (1 + +isRunning);

        if (movUpDown) {
            // this.updateShaderLightDirection(new Vector3(1, 1, 0));
            this.playAnimation(isRunning ? this.runAnim : this.walkAnim);
            // console.log(displacement * movUpDown);
            //displacement along the X axis
            const x = this.entity.getForward().dot(Vector3.Right());
            const z = this.entity.getForward().dot(Vector3.Forward());
            this.entity.moveWithCollisions(new Vector3(x, 0, z).normalize().scale(displacement * movUpDown));
        }
        if (movLeftRight) {
            this.playAnimation(isRunning ? this.runAnim : this.walkAnim);
            const t = movLeftRight == 1 ? Vector3.Up() : Vector3.Down();
            this.entity.moveWithCollisions(this.entity.getForward().cross(t).normalize().scale(displacement));
        }
        if (!movUpDown && !movLeftRight)
            this.playAnimation(this.idleAnim);
    }

    public beforeRenderUpdate(): void {
        // Gets the time spent between current and previous frame
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

        // jump if jump's key is pressed and not already jumping
        if (this.input.inputMap[this.input.jumpKey] && !this.isJumping) {
            this.jumpStartTime = performance.now();
            this.isJumping = true;
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

        this.moveBeforeUpdate(deltaTime);

        const oldRotation = this.entity.rotation;
        let newRotationX = oldRotation.x + this.input.MouseMovement.y * this.mouseSensibilityY;
        let newRotationY = oldRotation.y + this.input.MouseMovement.x * this.mouseSensibilityX;
        // Clamp the rotation to avoid flipping
        const margin = 0.05;
        if (newRotationX > Math.PI / 2 - margin) newRotationX = Math.PI / 2 - margin;
        if (newRotationX < -Math.PI / 2 + margin) newRotationX = -Math.PI / 2 + margin;
        if (newRotationY > 2 * Math.PI) newRotationY = 0;
        if (newRotationY < 0) newRotationY = 2 * Math.PI;

        // Apply the rotation to the camera


        // Set the new rotation
        this.entity.rotation = new Vector3(newRotationX, newRotationY, oldRotation.z);
        this.input.MouseMovement.y = this.input.MouseMovement.x = 0;


        const ray = new Ray(new Vector3(this.entity.position.x, this.entity.position.y - 1, this.entity.position.z), Vector3.Down(), 1);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedMesh && !this.entity.isSameMesh(hit.pickedMesh))
            return
        if (this.input.inputMap[this.input.escapeKey]) {
            this.input.isWorldPlaying = !this.input.isWorldPlaying;
            this.input.inputMap[this.input.escapeKey] = false;
            // TODO: add a pause menu
            //this.input.isWorldPlaying ? this.scene.getEngine().runRenderLoop(() => this.scene.render()) : this.scene.getEngine().stopRenderLoop();
        }
        /*if (this.entity.getPosition().y < 0) {
            this.entity.dispose();
            this.input.isWorldPlaying = false;
            Game.Instance.switchToGameOver();
        }*/
    }
}
