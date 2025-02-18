import { Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Component } from "../components/component";
import { GameEntity } from "./gameEntity";
import { KoombaController } from "../components/koombaController";

export class Koomba extends GameEntity {
    constructor(scene: LevelScene, ...components: Component[]) {
        super("koomba", scene, ...components)
    }

    public async instanciate(lightDirection: Vector3, position?: Vector3, rotation?: Vector3): Promise<void> {
        await super.instanciate(lightDirection, position, rotation);
        if (!this.mesh)
            throw new Error("Error while instanciating the GameEntity " + this.name);

        this.mesh.scaling = new Vector3(0.025, 0.025, 0.025);
        this.addComponent(new KoombaController(this, this.animations, this.scene));
    }

    public clone(name?: string, position?: Vector3, rotation?: Vector3, cloneComponents: boolean = false): GameEntity {
        const koomba = super.clone(name, position, rotation, cloneComponents);
        koomba.addComponent(new KoombaController(koomba, koomba.animations, koomba.scene));
        return koomba;
    }
}
