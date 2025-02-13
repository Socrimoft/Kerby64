import { ArcRotateCamera, Mesh, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import { Component } from "./component";

export class PlayerCamera extends ArcRotateCamera implements Component
{
    private mesh: Mesh;
    private camRoot: TransformNode;
    private camTilt: TransformNode;

    constructor(mesh: Mesh, scene: Scene) {
        super("playerCamera", Math.PI / 2, Math.PI / 3, 30, Vector3.Zero(), scene);
        this.mesh = mesh;
        this.camRoot = new TransformNode("root");
        this.camRoot.position = new Vector3(0, 0, 0);

        let camTilt = new TransformNode("camTilt");
        camTilt.rotation = new Vector3(Math.PI / 20, Math.PI, 0);
        this.camTilt = camTilt;
        this.camTilt.parent = this.camRoot;

        this.lockedTarget = this.camRoot.position;
        this.fov = 0.5;
        this.parent = this.camTilt;
    }

    public beforeRenderUpdate(): void {
        this.updatePosition();
    }

    private updatePosition(): void {
        this.camRoot.position = Vector3.Lerp(this.camRoot.position, new Vector3(this.mesh.position.x, this.mesh.position.y, this.mesh.position.z), 0.4);
        this.camRoot.rotationQuaternion = this.mesh.rotationQuaternion;
    }
}
