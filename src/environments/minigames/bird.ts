import { Color3, CubeTexture, DirectionalLight, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { LevelScene } from "../../scenes/levelScene";

export class Bird extends Environment {
    private segmentWidth: number = 6;
    private segmentHeight: number = 30;
    private lastSegmentX: number = -this.segmentWidth;
    private passageHeight: number = 10;

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
        this.createPassage(this.lastSegmentX - 3 + this.segmentWidth + 15, 20);

    }

    setupLight(): void {
        this.light = new DirectionalLight("dirLight", new Vector3(-1, -1, 1), this.scene);
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


        const topBlock = MeshBuilder.CreateCylinder("topBlock", {
            diameter: this.segmentWidth,
            height: (totalHeight - this.passageHeight) / 2,
            tessellation: 20 // Nombre de segments pour lisser le cylindre
        }, this.scene);
        const topBlockBottom = MeshBuilder.CreateCylinder("topBlockBottom", {
            diameter: this.segmentWidth + 2,
            height: 3,
            tessellation: 20 // Nombre de segments pour lisser le cylindre
        }, this.scene);

        topBlock.position = new Vector3(x, (totalHeight + this.passageHeight) / 4 + yOffset, 0);
        topBlockBottom.position = new Vector3(x, this.passageHeight - 3.5 + yOffset, 0);
        topBlock.checkCollisions = true;
        topBlockBottom.checkCollisions = true;

        const bottomBlock = MeshBuilder.CreateCylinder("bottomBlock", {
            diameter: this.segmentWidth,
            height: (totalHeight - this.passageHeight) / 2,
            tessellation: 20
        }, this.scene);
        const bottomBlockTop = MeshBuilder.CreateCylinder("bottomBlockTop", {
            diameter: this.segmentWidth + 2,
            height: 3,
            tessellation: 20
        }, this.scene);

        bottomBlock.position = new Vector3(x, -(totalHeight + this.passageHeight) / 4 + yOffset, 0);
        bottomBlockTop.position = new Vector3(x, - this.passageHeight / 2 - 1.5 + yOffset, 0);
        bottomBlock.checkCollisions = true;
        bottomBlockTop.checkCollisions = true;

        const metal = new StandardMaterial("blockMat", this.scene);
        metal.diffuseColor = new Color3(0.1, 0.5, 0.1); // Vert foncé
        metal.specularColor = new Color3(0.3, 1, 0.3); // Reflet vert clair
        metal.emissiveColor = new Color3(0, 0.2, 0); // Légère lueur verte
        metal.ambientColor = new Color3(0.1, 0.3, 0.1);

        // Augmenter la brillance pour un effet métallique
        metal.specularPower = 256;

        topBlock.material = metal;
        topBlockBottom.material = metal;

        bottomBlock.material = metal;
        bottomBlockTop.material = metal;

        this.pushGroundSegment(topBlock);
        this.pushGroundSegment(topBlockBottom);

        this.pushGroundSegment(bottomBlock);
        this.pushGroundSegment(bottomBlockTop);

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