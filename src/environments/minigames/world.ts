import { Color3, Color4, CubeTexture, DirectionalLight, MeshBuilder, NoiseProceduralTexture, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { LevelScene } from "../../scenes/levelScene";
import { ToonMaterial } from "../../materials/toonMaterial";
import { Block } from "../../world/block";
import { Chunk } from "../../world/chunk";

export class World extends Environment {
    private blockSize: number = Block.size;
    private static dayDuration = 1200000; //20min in ms
    private _tick = 0; //used to set skycolor
    private day = 0;
    private static knownSkyColor = {
        0: new Color3(0.447, 0.616, 0.929),
        167: new Color3(0.447, 0.616, 0.929),
        1000: new Color3(0.467, 0.663, 1),
        9000: new Color3(0.467, 0.663, 1),
        11834: new Color3(0.447, 0.616, 0.929),
        12040: new Color3(0.447, 0.616, 0.929),
        12542: new Color3(0.302, 0.420, 0.635),
        12610: new Color3(0.282, 0.396, 0.6),
        12786: new Color3(0.235, 0.329, 0.498),
        12969: new Color3(0.188, 0.263, 0.396),
        13000: new Color3(0.176, 0.251, 0.380),
        13188: new Color3(0.129, 0.184, 0.275),
        13702: new Color3(0.129, 0.184, 0.275),
        17843: new Color3(0, 0, 0),
        18000: new Color3(0, 0, 0),
        22300: new Color3(0.129, 0.184, 0.275),
        22812: new Color3(0.129, 0.184, 0.275),
        23000: new Color3(0.176, 0.251, 0.380),
        23031: new Color3(0.188, 0.263, 0.396),
        23041: new Color3(0.188, 0.267, 0.404),
        23216: new Color3(0.235, 0.329, 0.498),
        23460: new Color3(0.302, 0.420, 0.635),
        23961: new Color3(0.424, 0.6, 0.909),
        23992: new Color3(0.447, 0.616, 0.929),
        24000: new Color3(0.447, 0.616, 0.929)
    }

    constructor(scene: LevelScene, player: Player) {
        super(scene, player);
        Block.scene = scene;
        globalThis.world = this;
    }

    public get tick() {
        return Math.floor(this._tick);
    }
    public set tick(newtick: number) {
        this._tick = newtick;
    }
    private set skyColor(newcolor: Color4 | Color3) {
        const color = new Color3(newcolor.r, newcolor.g, newcolor.b);
        (this.skybox.material as StandardMaterial).emissiveColor = color;
    }

    private updateSkyColor() {
        const keys = Object.keys(World.knownSkyColor).map(Number); //.sort((a, b) => a - b);
        const currentTick = this.tick;
        let lowerKey = keys[0];
        let upperKey = keys[keys.length - 1];

        for (let i = 0; i < keys.length; i++) {
            if (keys[i] <= currentTick) {
                lowerKey = keys[i];
            }
            if (keys[i] >= currentTick) {
                upperKey = keys[i];
                break;
            }
        }

        if (lowerKey === upperKey) {
            this.skyColor = World.knownSkyColor[lowerKey];
        } else {
            const lowerColor = World.knownSkyColor[lowerKey];
            const upperColor = World.knownSkyColor[upperKey];
            const factor = (currentTick - lowerKey) / (upperKey - lowerKey);

            this.skyColor = new Color4(
                lowerColor.r + factor * (upperColor.r - lowerColor.r),
                lowerColor.g + factor * (upperColor.g - lowerColor.g),
                lowerColor.b + factor * (upperColor.b - lowerColor.b),
                1
            );
        }
    }
    setupSkybox(): void {
        this.skybox.position = new Vector3(0, this.skyboxSize / 8, 0);
        const skyboxMaterial = new StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("./assets/images/world/skybox/", this.scene, ["sun.png", "_.png", "_.png", "moon.png", "_.png", "_.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        this.skybox.material = skyboxMaterial;
        this.skybox.infiniteDistance = true;
    }

    async loadTerrain(): Promise<void> {
        // this is a test
        // TODO: remove this
        // TODO: add a terrain generator
        // TODO: make it procedural
        // TODO: add some perlin noise(s)
        const testGround = MeshBuilder.CreateBox("test", { size: 1, width: 1, height: 1 });
        testGround.position = new Vector3(0, 10, 0);
        const grassTexture = new NoiseProceduralTexture("grassTexture", 16, this.scene);
        const grassMaterial = new ToonMaterial(grassTexture, this.getLight(), false, this.scene);
        testGround.checkCollisions = true;
        testGround.material = grassMaterial;
    }

    async loadEnvironment(): Promise<void> {
        console.log(this.seed);
        if (!this.seed) {
            await this.loadDebugEnvironment();
            return;
        }
        await this.loadTerrain();
    }
    async loadDebugEnvironment() {
        Chunk.debugChunk(this.scene);
    }

    setupLight(): void {
        this.light = new DirectionalLight("dirLight", new Vector3(0, -1, 0), this.scene);
        Block.light = this.light;
        this.light.intensity = 1;
        this.light.shadowEnabled = true;
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
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        this.tick = this._tick + deltaTime * 20; //bypass math.floor to keep accuracy
        if (this._tick > 24000) {
            this.tick = this._tick - 24000;
            this.day++;
        }
        this.updateSkyColor();
        this.skybox.rotation.z = this.tick / 24000 * 2 * Math.PI;
    }

    public async load(classicLevel?: number): Promise<void> {
        this.player.position = new Vector3(0, 120, 0);
        await super.load(classicLevel);
        //this.setupLight();
        //this.setupSkybox();
        //await this.loadEnvironment(classicLevel);
    }
}
