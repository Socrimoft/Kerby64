import { Color3, CubeTexture, DirectionalLight, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { LevelScene } from "../../scenes/levelScene";

export class Bird extends Environment {
    private segmentWidth: number = 6;
    private segmentHeight: number = 30;
    private lastSegmentX: number = -this.segmentWidth;
    private passageHeight: number = 8;

    constructor(scene: LevelScene, player: Player) {
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
        this.createPassage(this.lastSegmentX - 3 + this.segmentWidth + 15, 19);

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

        const ground = MeshBuilder.CreateBox("groundSegment", {
            width: this.segmentWidth,
            depth: 20,
            height: this.segmentHeight
        }, this.scene);

        ground.position = new Vector3(x + this.segmentWidth / 2 + 10, 0, 0);
        ground.checkCollisions = true;

        const mat = new StandardMaterial("groundMat", this.scene);
        mat.diffuseColor = new Color3(0.8, 0.5, 0.25);
        ground.material = mat;

        this.pushGroundSegment(ground);
        this.lastSegmentX = x;
    }


    private createPassage(x: number, yOffset: number): void {
        const totalHeight = this.segmentHeight * 4;

        const topBlock = MeshBuilder.CreateBox("topBlock", {
            width: this.segmentWidth,
            depth: 20,
            height: (totalHeight - this.passageHeight) / 2
        }, this.scene);

        topBlock.position = new Vector3(x, (totalHeight + this.passageHeight) / 4 + yOffset, 0);
        topBlock.checkCollisions = true;

        const bottomBlock = MeshBuilder.CreateBox("bottomBlock", {
            width: this.segmentWidth,
            depth: 20,
            height: (totalHeight - this.passageHeight) / 2
        }, this.scene);

        bottomBlock.position = new Vector3(x, -(totalHeight + this.passageHeight) / 4 + yOffset, 0);
        bottomBlock.checkCollisions = true;

        const mat = new StandardMaterial("blockMat", this.scene);
        mat.diffuseColor = new Color3(0.8, 0.5, 0.25);
        topBlock.material = mat;
        bottomBlock.material = mat;

        this.pushGroundSegment(topBlock);
        this.pushGroundSegment(bottomBlock);

        this.lastSegmentX = x;
    }



    beforeRenderUpdate(): void {
        while (this.lastSegmentX < this.player.getPosition().x + 50) {
            let random = Math.random();

            if (random < 0.2) {
                this.createPassage(this.lastSegmentX + this.segmentWidth + 20, 18);
            } else if (random < 0.4 && random >= 0.2) {
                this.createPassage(this.lastSegmentX + this.segmentWidth + 20, 23);
            } else if (random < 0.6 && random >= 0.4) {
                this.createPassage(this.lastSegmentX + this.segmentWidth + 20, 16);
            } else if (random < 0.8 && random >= 0.6) {
                this.createPassage(this.lastSegmentX + this.segmentWidth + 20, 25);
            } else {
                this.createPassage(this.lastSegmentX + this.segmentWidth + 20, 10);
            }
        }
    }

}