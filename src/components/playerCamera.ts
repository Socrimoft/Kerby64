import { Mesh, Scene, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import { Component } from "./component";
import { GameEntity } from "../actors/gameEntity";

export class PlayerCamera extends UniversalCamera implements Component {
    private targetEntity: GameEntity;
    private camRoot: TransformNode;
    private camTilt: TransformNode;

    constructor(targetEntity: GameEntity) {
        super("playerCamera", new Vector3(0, 0, targetEntity.getPosition().z - 20), targetEntity.scene);
        this.targetEntity = targetEntity;

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
        this.camRoot.position = Vector3.Lerp(this.camRoot.position, new Vector3(this.targetEntity.getPosition().x + (this.targetEntity.getForward().x * 5), this.targetEntity.getPosition().y + 3, this.targetEntity.getPosition().z), 0.1);
    }
}
