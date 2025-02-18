import { Color3, CubeTexture, DirectionalLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { ToonMaterial } from "../../materials/toonMaterial";

export class Rush extends Environment {
    private segmentWidth: number = 10;
    private segmentHeight: number = 20;
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
        this.light = new DirectionalLight("dirLight", new Vector3(1, 1, 0), this.scene);
    }

    getLightDirection(): Vector3 {
        return this.light ? this.light.direction.normalize() : Vector3.Zero();
    }

    setLightDirection(direction: Vector3): void {
        if (this.light)
            this.light.direction = direction;
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
            height: this.segmentHeight
        }, this.scene);

        ground.position = new Vector3(x + this.segmentWidth / 2, heightOffset - 0.5, 0);
        ground.checkCollisions = true;

        ground.material = new ToonMaterial(new Color3(0.8, 0.5, 0.25), this.getLightDirection(), false, this.scene);

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
