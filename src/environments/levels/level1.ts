import { Color3, CubeTexture, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";

export class Level1 extends Environment {
    private segmentWidth: number = 10;
    private lastSegmentX: number = -this.segmentWidth;

    constructor(scene: Scene, player: Player) {
        super(scene, player);
    }

    setupSkybox(): void {
        this.skybox.position = new Vector3(0, this.skyboxSize / 8, 0);
        const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("./assets/images/skybox/", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        this.skybox.material = skyboxMaterial;
    }

    async loadEnvironment(): Promise<void> {
        for (let i = -2; i < 5; i++) {
            this.createGroundSegment(i * this.segmentWidth);
        }
    }

    setupLight(): void {
        const light = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), this.scene);
    }

    private createGroundSegment(x: number): void {
        const random = Math.random();

        if (random < 0.2) {
            this.lastSegmentX = x;
            return;
        }

        let heightOffset = 0;
        if (random < 0.4)
            heightOffset = 2;

        const ground = MeshBuilder.CreateBox("groundSegment", {
            width: this.segmentWidth,
            depth: 10,
            height: 1
        }, this.scene);

        ground.position = new Vector3(x + this.segmentWidth / 2, heightOffset - 0.5, 0);
        ground.checkCollisions = true;

        const mat = new StandardMaterial("groundMat", this.scene);
        mat.diffuseColor = new Color3(0.8, 0.5, 0.25);
        ground.material = mat;

        this.pushGroundSegment(ground);
        this.lastSegmentX = x;
    }

    beforeRenderUpdate(): void {
        while (this.lastSegmentX < this.player.mesh.position.x + 50) {
            this.createGroundSegment(this.lastSegmentX + this.segmentWidth);
        }

        this.setGroundSegments(this.getGroundSegments().filter(segment => {
            if (segment.position.x + this.segmentWidth < this.player.mesh.position.x - 30) {
                segment.dispose();
                return false;
            }
            return true;
        }));
    }
}
