import { Color3, CubeTexture, DirectionalLight, MeshBuilder, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { ToonMaterial } from "../../materials/toonMaterial";
import { LevelScene } from "../../scenes/levelScene";
import { Koomba } from "../../actors/koomba";

export class Rush extends Environment {
    private segmentWidth: number = 10;
    private segmentHeight: number = 20;
    private lastSegmentX: number = -this.segmentWidth;
    private koombas: Koomba[] = [];
    private groundMaterial?: ToonMaterial;

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
        for (let i = -2; i < 5; i++) {
            this.createGroundSegment(i * this.segmentWidth);
        }
        this.koombas[0] = new Koomba(this.scene);
        await this.koombas[0].instanciate(this.getLight(), new Vector3(10, 0, -2.5), new Vector3(0, -Math.PI / 2, 0));
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

    private createGroundSegment(x: number): void {
        const random = this.random.random();

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

        ground.material = this.groundMaterial || (this.groundMaterial = new ToonMaterial(new Color3(0, 0.6, 0), this.getLight(), false, this.scene));

        this.pushGroundSegment(ground);
        this.lastSegmentX = x;

        if (this.koombas[0] && random < 0.8) {
            const koombaClone = this.koombas[0].clone("koomba" + x, new Vector3(x, 20, 0));
            koombaClone.activateEntityComponents();
            this.koombas.push(koombaClone);
            this.koombas.filter((koomba) => koomba.isDisposed);
        }
    }

    beforeRenderUpdate(): void {
        while (this.lastSegmentX < this.player.position.x + 50) {
            this.createGroundSegment(this.lastSegmentX + this.segmentWidth);
        }

        this.setGroundSegments(this.getGroundSegments().filter(segment => {
            if (segment.position.x + this.segmentWidth < this.player.position.x - 30) {
                segment.dispose();
                return false;
            }
            return true;
        }));
    }
}
