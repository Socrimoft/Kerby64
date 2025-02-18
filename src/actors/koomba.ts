import { AnimationGroup, LoadAssetContainerAsync, Mesh, Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Component } from "../components/component";
import { ToonMaterial } from "../materials/toonMaterial";
import { GameEntity } from "./gameEntity";
import { EntityController } from "../components/entityController";
import { Anim } from "../components/anim";

export class Koomba extends GameEntity {
    constructor(scene: LevelScene, ...components: Component[]) {
        super("koomba", scene, ...components)
    }

    public async loadEntityAssets(lightDirection: Vector3, loaded?: { mesh: Mesh, animations: AnimationGroup[], newposX: number }): Promise<void> {
        if (loaded) {
            this.mesh.dispose();
            this.mesh = loaded.mesh //assume that loaded.mesh is already cloned !!!!
            loaded.animations.forEach((ag) => {
                this.animations.push(ag);
            });
        }
        else {
            const models = await LoadAssetContainerAsync(this.baseSourceURI + this.name + ".glb", this.scene);
            const root = (models.rootNodes.length == 1 && models.rootNodes[0] instanceof Mesh) ? models.rootNodes[0] : models.createRootMesh();
            root.name = this.name;
            root.id = this.name;
            models.meshes.forEach((mesh) => {
                //mesh.material = new ToonMaterial(models.textures[0], lightDirection, models.animationGroups.length > 0, this.scene);
            });

            models.addAllToScene();

            models.animationGroups.forEach((ag) => {
                this.animations.push(ag);
            });
            this.mesh = root;
        }
        this.mesh.scaling = new Vector3(0.025, 0.025, 0.025);
        this.mesh.position = new Vector3(loaded ? loaded.newposX : 0, 11, 0);
        this.mesh.rotation = new Vector3(0, -Math.PI / 2, 0);
        this.addComponent(new koombaController(this.mesh, this.animations, this.scene))
    }
}

class koombaController extends EntityController implements Anim {
    protected linearSpeed = 1;
    idleAnim = undefined;
    walkAnim: AnimationGroup;
    runAnim = undefined;

    constructor(mesh: Mesh, animations: AnimationGroup[], scene: LevelScene) {
        super(mesh, scene);
        const walkAnim = animations.find(ag => ag.name.toLowerCase().includes("take 001"));
        if (!walkAnim) {
            throw new Error("Walk animation not found for " + mesh.name);
        }
        this.walkAnim = walkAnim;
        this.meshAnimations.push(this.walkAnim);
        this.playAnimation(this.walkAnim);
    }

    beforeRenderUpdate(): void {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        const oldPosX = this.mesh.position.x
        this.mesh.moveWithCollisions(this.mesh.forward.scale(this.linearSpeed * deltaTime));
        this.mesh.moveWithCollisions(new Vector3(0, this.gravity * deltaTime, 0));
        if (oldPosX == this.mesh.position.x) {
            //koomba is stuck
            this.mesh.rotation.y = -this.mesh.rotation.y
        }
    }

}