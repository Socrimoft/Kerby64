import { AbstractMesh, AnimationGroup, AssetContainer, DirectionalLight, LoadAssetContainerAsync, Mesh, PBRMaterial, ShaderMaterial, StandardMaterial, Vector3 } from "@babylonjs/core";
import { LevelScene } from "../scenes/levelScene";
import { Component } from "../components/component";
import { ToonMaterial } from "../materials/toonMaterial";

export class GameEntity {
    public scene: LevelScene;
    public name: string;
    private assets?: AssetContainer;
    protected mesh?: Mesh;
    private animations: Record<string, AnimationGroup> = {};
    public components: Array<Component> = [];
    public baseSourceURI = "./assets/models/";
    private boundfct?: () => void;
    public isDisposed = false;

    constructor(name: string, scene: LevelScene, ...components: Component[]) {
        this.scene = scene;
        this.name = name;
        this.components.push(...components);
    }

    public async instanciate(light: DirectionalLight, position?: Vector3, rotation?: Vector3): Promise<void> {
        this.assets = await LoadAssetContainerAsync(this.baseSourceURI + this.name + ".glb", this.scene);
        const root = (this.assets.rootNodes.length == 1 && this.assets.rootNodes[0] instanceof Mesh) ? this.assets.rootNodes[0] : this.assets.createRootMesh();
        root.name = this.name;

        this.assets.meshes.forEach((mesh) => {
            if (this.assets && this.assets.textures[0])
                mesh.material = new ToonMaterial(this.assets.textures[0], light, mesh, this.scene);
            else if (this.assets && mesh.material && mesh.material instanceof StandardMaterial)
                mesh.material = new ToonMaterial(mesh.material.diffuseColor, light, mesh, this.scene);
            else if (this.assets && mesh.material && mesh.material instanceof PBRMaterial)
                mesh.material = new ToonMaterial(mesh.material.albedoColor, light, mesh, this.scene);
        });

        this.assets.addAllToScene();

        if (this.mesh) this.dispose();
        this.mesh = root;
        this.isDisposed = false;
        this.mesh.position = position ? position : Vector3.Zero();
        if (rotation) this.mesh.rotation = rotation;
    }

    public clone(name?: string, position?: Vector3, rotation?: Vector3, cloneComponents: boolean = false): GameEntity {
        if (!this.assets)
            throw new Error("Unable to clone a non-instantiated GameEntity");

        const clonedEntity = cloneComponents ? new GameEntity(name ? name : this.name, this.scene, ...this.components) : new GameEntity(this.name, this.scene);

        const entries = this.assets.instantiateModelsToScene(undefined, true, { doNotInstantiate: true });
        clonedEntity.assets = this.assets;
        clonedEntity.mesh = (entries.rootNodes[0] as Mesh);

        if (position) clonedEntity.mesh.position = position;
        if (rotation) clonedEntity.mesh.rotation = rotation;

        return clonedEntity;
    }

    public dispose() {
        if (this.mesh) this.mesh.dispose();
        if (this.boundfct)
            this.scene.unregisterBeforeRender(this.boundfct)
        this.isDisposed = true;
    }

    public registerAnimations(names: string[]): void {
        if (!this.assets)
            throw new Error("Unable to register animations of a non-instantiated GameEntity");

        for (const name of names) {
            const anim = this.assets.animationGroups.find(ag => name === ag.name);

            if (!anim)
                throw new Error(name + " animation not found");

            this.animations[name] = anim;
        }
    }

    public getAnimByName(name: string) {
        if (!this.animations[name])
            throw new Error("Cannot return the unregistered animation: " + name);
        return this.animations[name];
    }

    public stopAllAnims(): void {
        Object.values(this.animations).forEach(ag => ag.stop());
    }

    public addComponent(component: Component) {
        this.components.push(component)
    }

    public activateEntityComponents(): void {
        this.boundfct = this.beforeRenderUpdate.bind(this)
        this.scene.registerBeforeRender(this.boundfct);
    }
    private beforeRenderUpdate() {
        this.components.forEach((comp) => { comp.beforeRenderUpdate() })
    }

    public getPosition(): Vector3 {
        return this.mesh ? this.mesh.position : Vector3.Zero();
    }

    public setPosition(position: Vector3): void {
        if (this.mesh) this.mesh.position = position;
    }

    public getRotation(): Vector3 {
        return this.mesh ? this.mesh.rotation : Vector3.Zero();
    }

    public setRotation(rotation: Vector3): void {
        if (this.mesh) this.mesh.rotation = rotation;
    }

    public getForward(): Vector3 {
        return this.mesh ? this.mesh.forward : Vector3.Zero();
    }

    public isSameMesh(otherMesh: AbstractMesh): boolean {
        return this.mesh ? this.mesh == otherMesh : false;
    }

    public moveWithCollisions(displacement: Vector3): void {
        if (this.mesh) this.mesh.moveWithCollisions(displacement);
    }

    public moveForwardWithCollisions(scale: number): void {
        if (this.mesh) this.moveWithCollisions(this.mesh.forward.scale(scale));
    }

    public updateShaderLightDirection(direction: Vector3) {
        if (!this.mesh) return;

        this.mesh.getChildMeshes().forEach(mesh => {
            if (mesh.material && mesh.material instanceof ShaderMaterial) {
                mesh.material.setVector3("lightDirection", direction);
            }
        });
    }
}
