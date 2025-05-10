import { Environment } from "../environment";
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
    }

    setupLight(): void {
        this.level?.setupLight();
    }

    beforeRenderUpdate(): void {
        this.level?.beforeRenderUpdate();
    }
}
