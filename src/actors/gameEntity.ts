import { AnimationGroup, LoadAssetContainerAsync, Mesh, Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Component } from "../components/component";
import { ToonMaterial } from "../materials/toonMaterial";

export class GameEntity {
    public scene: LevelScene;
    public mesh: Mesh;
    public name: string;
    public animations: AnimationGroup[] = [];
    public components: Array<Component> = [];
    public baseSourceURI = "./assets/models/";

    constructor(name: string, scene: LevelScene, ...components: Component[]) {
        this.scene = scene;
        this.name = name
        this.mesh = new Mesh(name, scene);
        this.mesh.position = Vector3.Zero();
        this.components.concat(components);
    }

    public async loadEntityAssets(lightDirection: Vector3): Promise<void> {
        const models = await LoadAssetContainerAsync(this.baseSourceURI + this.name + ".glb", this.scene);
        const root = (models.rootNodes.length == 1 && models.rootNodes[0] instanceof Mesh) ? models.rootNodes[0] : models.createRootMesh();
        root.name = this.name;
        root.id = this.name;
        models.meshes.forEach((mesh) => {
            mesh.material = new ToonMaterial(models.textures[0], lightDirection, models.animationGroups.length > 0, this.scene);
        });

        models.addAllToScene();

        models.animationGroups.forEach((ag) => {
            this.animations.push(ag);
        });
        console.log(this.animations)
        this.mesh.dispose();
        this.mesh = root;
    }

    public addComponent(component: Component) {
        this.components.push(component)
    }

    public activateEntityComponents(): void {
        this.scene.registerBeforeRender(() => {
            this.components.forEach((comp) => {
                comp.beforeRenderUpdate();
            });
        });
    }
}
