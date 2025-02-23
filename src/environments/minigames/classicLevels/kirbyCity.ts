import { Color3, CubeTexture, DirectionalLight, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Player } from "../../../actors/player";
import { LevelScene } from "../../../scenes/levelScene";
import { Environment } from "../../environment";

export class KirCity extends Environment {
    constructor(scene: LevelScene, player: Player) {
        super(scene, player);
    }

    setupSkybox(): void {
        this.skybox.position = new Vector3(0, this.skyboxSize / 8, 0);
        const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("./assets/images/bird/skybox/", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        this.skybox.material = skyboxMaterial;
        this.skybox.infiniteDistance = true;
    }

    setupLight(): void {
        this.light = new DirectionalLight("dirLight", new Vector3(1, -1, 1), this.scene);
    }

    getLightDirection(): Vector3 {
        return this.light ? this.light.direction.normalize() : Vector3.Zero();
    }

    setLightDirection(direction: Vector3): void {
        if (this.light)
            this.light.direction = direction;
    }

    async loadEnvironment() {
        throw new Error("Method not implemented.");
    }

    beforeRenderUpdate(): void {
        throw new Error("Method not implemented.");
    }
}