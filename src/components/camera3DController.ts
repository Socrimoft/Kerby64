import { Mesh, UniversalCamera, Vector3 } from "@babylonjs/core"
import { Component } from "./component";
import { Player } from "../actors/player";
import { InputManager } from "../inputManager";
import { LevelScene } from "../scenes/levelScene";

enum CameraMode {
    FPSMode,        // 
    TPSBehindMode,  //
    TPSAheadMode    //
}

export class Camera3DController implements Component {
    private tpsCamera: UniversalCamera;
    private fpsCamera: UniversalCamera;
    private kerbyHands: Mesh;
    public currentCamera: CameraMode = 0;
    private scene: LevelScene;
    tpsCameraCollider: Mesh;

    constructor(private targetEntity: Player, private input: InputManager) {
        this.scene = this.targetEntity.scene;
        const kerbyHand = this.targetEntity.meshRef.getChildMeshes(false, (node) => node.name === "Object_15")[0];
        if (!(kerbyHand instanceof Mesh)) throw new Error("Kerby head not found");
        this.kerbyHands = kerbyHand;
        this.tpsCamera = new UniversalCamera("tpsCamera", Vector3.Zero(), this.targetEntity.scene);
        this.tpsCameraCollider = new Mesh("tpsCameraCollider", this.scene);
        this.tpsCameraCollider.checkCollisions = true;
        this.tpsCamera.parent = this.tpsCameraCollider;
        this.fpsCamera = new UniversalCamera("fpsCamera", this.targetEntity.position, this.targetEntity.scene);
        this.scene.activeCamera = this.fpsCamera;
        this.fpsCamera.minZ = 0;
        this.tpsCamera.minZ = 0;
        this.changeActiveCamera(0);
    }

    public get activeCamera() {
        return this.currentCamera ? this.tpsCamera : this.fpsCamera;
    }
    public set fov(newfov: number) {
        this.fpsCamera.fov = this.tpsCamera.fov = newfov;
    }
    public get fov() {
        return this.activeCamera.fov;
    }
    private changeActiveCamera(forceCameraMode?: CameraMode) {
        this.currentCamera = forceCameraMode ?? (this.currentCamera + 1) % 3;
        if (this.kerbyHands.material) this.kerbyHands.material.backFaceCulling = true;
        this.scene.activeCamera = this.activeCamera;

    }

    public beforeRenderUpdate(): void {
        // update position
        if (this.input.inputMap[this.input.cameraKey]) {
            this.changeActiveCamera();
            this.input.inputMap[this.input.cameraKey] = false;
        }
        switch (this.currentCamera) {
            case (CameraMode.FPSMode):
                this.fpsCamera.position = this.targetEntity.position;
                this.fpsCamera.rotation = this.targetEntity.rotation;
                break;
            case (CameraMode.TPSBehindMode):
                this.tpsCamera.target = this.targetEntity.position;
                this.tpsCamera.rotation = this.targetEntity.rotation;
                this.tpsCameraCollider.position = this.targetEntity.getForward().scale(-30);

                break;
            case (CameraMode.TPSAheadMode):
                this.tpsCamera.target = this.targetEntity.position;
                this.tpsCamera.rotation = this.targetEntity.rotation.negate();
                this.tpsCameraCollider.position = this.targetEntity.getForward().scale(-30)
                break;
        }
    }

}