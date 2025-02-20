import { Color3, CubeTexture, DirectionalLight, MeshBuilder, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { ToonMaterial } from "../../materials/toonMaterial";
import { LevelScene } from "../../scenes/levelScene";

export class World extends Environment {
    private segmentWidth: number = 10;

    constructor(scene: LevelScene, player: Player) {
        super(scene, player);
    }

    setupSkybox(): void {
        this.skybox.position = new Vector3(0, this.skyboxSize / 8, 0);
        const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("./assets/images/rush/skybox/", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        this.skybox.material = skyboxMaterial;
        this.skybox.infiniteDistance = true;
    }

    async loadEnvironment(): Promise<void> {

    }

    setupLight(): void {
        this.light = new DirectionalLight("dirLight", new Vector3(1, 1, 0), this.scene);
        this.light.intensity = 0.8;
        this.light.diffuse = new Color3(1, 0.95, 0.8);
    }

    getLightDirection(): Vector3 {
        return this.light ? this.light.direction.normalize() : Vector3.Zero();
    }

    setLightDirection(direction: Vector3): void {
        if (this.light)
            this.light.direction = direction;
    }

    beforeRenderUpdate(): void {
        const random = this.random.random();
    }
}
