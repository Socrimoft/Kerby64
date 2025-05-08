import { DirectionalLight, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { LevelScene } from "../../scenes/levelScene";
import { KirClassic } from "./classicLevels/kirbyClassic";
import { KirCity } from "./classicLevels/kirbyCity";
import { KirBros } from "./classicLevels/kirBros";
import { KirbyKawaii } from "./classicLevels/kirbyKawaii";
import { KirDoom } from "./classicLevels/kirDoom";



export class Classic extends Environment {
    private level?: Environment;


    setupSkybox(): void {
        this.level?.setupSkybox();
    }


    async loadEnvironment(classicLevel?: number): Promise<void> {
        const levels = [KirClassic, KirCity, KirBros, KirbyKawaii, KirDoom];

        if (!classicLevel) classicLevel = 0;
        this.level = new levels[classicLevel](this.scene, this.player);
        await this.level?.loadEnvironment();

        this.setupSkybox();
        this.setupLight();
    }

    setupLight(): void {
        const light = this.level?.setupLight() || new DirectionalLight("light", new Vector3(1, 1, -1), this.scene);
    }

    beforeRenderUpdate(): void {
        this.level?.beforeRenderUpdate();
    }
}
