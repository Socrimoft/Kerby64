import { Color3, CubeTexture, DirectionalLight, MeshBuilder, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { LevelScene } from "../../scenes/levelScene";
import { KirClassic } from "./classicLevels/kirbyClassic";
import { KirCity } from "./classicLevels/kirbyCity";
import { KirBros } from "./classicLevels/kirBros";
import { KirbyKawaii } from "./classicLevels/kirbyKawaii";
import { KirDoom } from "./classicLevels/kirdoom";



export class Classic extends Environment {
    private level?: Environment;

    constructor(scene: LevelScene, player: Player) {
        super(scene, player);
    }

    setupSkybox(): void {
        this.level?.setupSkybox();
    }


    async loadEnvironment(classicLevel): Promise<void> {
        this.skybox.dispose();
        const levels = [KirClassic, KirCity, KirBros, KirbyKawaii, KirDoom];

        classicLevel = classicLevel && classicLevel >= 0 && classicLevel < levels.length ? classicLevel : 0;
        this.level = new levels[classicLevel](this.scene, this.player);
        await this.level?.loadEnvironment();
    }

    setupLight(): void {
        this.level?.setupLight();
    }

    getLightDirection(): Vector3 {
        return this.level?.getLightDirection() || Vector3.Zero();
    }

    setLightDirection(direction: Vector3): void {
        this.level?.setLightDirection(direction);
    }

    beforeRenderUpdate(): void {
        this.level?.beforeRenderUpdate();
    }
}
