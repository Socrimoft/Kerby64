import { AnimationGroup, LoadAssetContainerAsync, Mesh } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Component } from "../components/component";

export class GameEntity {
    public scene: LevelScene;
    public mesh: Mesh;
    public components: Component[] = [];
    public static baseSourceURI = "./assets/models/";

    constructor(mesh: Mesh, scene: LevelScene, ...components: Component[]) {
        this.scene = scene;
        this.mesh = mesh;
        this.components.concat(components);
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

    public static async loadEntityAssets(name: string, filename: string, scene: LevelScene): Promise<{ root: Mesh, animations: Array<AnimationGroup> }> {
        const models = await LoadAssetContainerAsync(this.baseSourceURI + filename, scene);
        let root = models.createRootMesh();
        root.name = name;
        models.addAllToScene();

        const animations: AnimationGroup[] = [];
        models.animationGroups.forEach((ag) => {
            animations.push(ag);
        });

        return { root, animations };
    }
}
