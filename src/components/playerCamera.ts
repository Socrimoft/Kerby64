import { Mesh, Scene, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import { Component } from "./component";

export class PlayerCamera extends UniversalCamera implements Component {
    private mesh: Mesh;
    private camRoot: TransformNode;
    private camTilt: TransformNode;

    constructor(mesh: Mesh, scene: Scene) {
        super("playerCamera", new Vector3(0, 0, mesh.position.z - 20), scene);
        this.mesh = mesh;

        this.camRoot = new TransformNode("camRoot");
        this.camRoot.position = Vector3.Zero();
        this.lockedTarget = this.camRoot.position;

        let camTilt = new TransformNode("camTilt");
        camTilt.rotation = new Vector3(Math.PI / 15, 0, 0);
        this.camTilt = camTilt;
        this.camTilt.parent = this.camRoot;

        this.parent = this.camTilt;
    }

    public beforeRenderUpdate(): void {
        // update position
        this.camRoot.position = Vector3.Lerp(this.camRoot.position, new Vector3(this.mesh.position.x + (this.mesh.forward.x * 5), this.mesh.position.y + 3, this.mesh.position.z), 0.1);
    }
}
