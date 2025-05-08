import { Color3, Color4, DirectionalLight, Mesh, MeshBuilder, Texture, Vector3 } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { LevelScene } from "../../scenes/levelScene";
import { ToonMaterial } from "../../materials/toonMaterial";
import { Block } from "../../voxel/block";
import { Chunk } from "../../voxel/chunk";
import { VoxelEngine } from "../../voxel/voxelEngine";

export class World extends Environment {
    private readonly dayDuration = 1200000; //20min in ms
    private readonly maxTick = 24000; // 24h in ticks
    protected readonly skyboxSize = 10; // in blocks
    private _tick = 0; //used to set skycolor
    private day = 0;
    private readonly knownSkyColor = {
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

    private voxelEngine: VoxelEngine;

    constructor(scene: LevelScene, player: Player, seed?: number) {
        super(scene, player, seed);
        globalThis.world = this; // ??

        this.voxelEngine = new VoxelEngine(scene, this.seed);
    }

    public get tick() {
        return Math.floor(this._tick);
    }
    public set tick(newtick: number) {
        this._tick = newtick;
    }
    private set skyColor(newcolor: Color4 | Color3) {
        this.scene.clearColor = newcolor instanceof Color4 ? newcolor : newcolor.toColor4();
    }

    private updateSkyColor() {
        const keys = Object.keys(this.knownSkyColor).map(Number); //.sort((a, b) => a - b);
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
            this.skyColor = this.knownSkyColor[lowerKey];
        } else {
            const lowerColor = this.knownSkyColor[lowerKey];
            const upperColor = this.knownSkyColor[upperKey];
            const factor = (currentTick - lowerKey) / (upperKey - lowerKey);

            this.skyColor = new Color4(
                lowerColor.r + factor * (upperColor.r - lowerColor.r),
                lowerColor.g + factor * (upperColor.g - lowerColor.g),
                lowerColor.b + factor * (upperColor.b - lowerColor.b),
                1
            );
        }
    }
    // there is no skybox, but 2 planes with a diffuseTexture to handle the image transparency
    setupSkybox(): void {
        this.skybox.dispose();
        this.skybox = new Mesh("skybox", this.scene); // should be a TransformNode, but inheritance is in the way
        this.skybox.position = new Vector3(0, 0, 0);

        const sun = MeshBuilder.CreatePlane("sun", { size: this.voxelEngine.renderDistance * this.skyboxSize }, this.scene);
        const sunTexture = new Texture("./assets/images/world/skybox/sun.png", this.scene, undefined, undefined, Texture.NEAREST_SAMPLINGMODE);
        sunTexture.hasAlpha = true;
        sun.material = new ToonMaterial("sunMaterial", sunTexture, this.scene);
        sun.setParent(this.skybox);
        sun.position = new Vector3(this.voxelEngine.renderDistance * Chunk.chunkSize.x, 0, 0);
        sun.rotation.y = -Math.PI / 2;

        const moon = MeshBuilder.CreatePlane("moon", { size: this.voxelEngine.renderDistance * this.skyboxSize }, this.scene);
        const moonTexture = new Texture("./assets/images/world/skybox/sun.png", this.scene, undefined, undefined, Texture.NEAREST_SAMPLINGMODE);
        moonTexture.hasAlpha = true;
        moon.material = new ToonMaterial("moonMaterial", moonTexture, this.scene);
        moon.setParent(this.skybox);
        moon.position = new Vector3(-this.voxelEngine.renderDistance * Chunk.chunkSize.x, 0, 0);
        moon.rotation.y = Math.PI / 2;
    }

    loadTerrain(): void {
        this.scene.getEngine().hideLoadingUI();
        if (this.voxelEngine.worldType.type === "flat") {
            this.voxelEngine.loadChunkwithinRenderDistance(this.player.position);
            // const x = 0;
            // const z = 0;

            // const chunkKey = `${x}_${z}`;
            // if (!this.chunksBuffer[chunkKey]) {
            //     this.chunksBuffer[chunkKey] = new Chunk(new Vector2(x, z), this.scene);
            //     this.chunksBuffer[chunkKey].populate(this.WorldType);
            // }

        } /*else if (this.WorldType?.noise === "SimplexPerlin3DBlock") {
            const noise = new SimplexPerlin3DBlock(this.scene, { frequency: 0.1 });
            noise.setScale(1, 1, 1);
            noise.setOffset(0, 0, 0);
            noise.setNoiseScale(1, 1, 1);
            noise.setNoiseOffset(0, 0, 0);
            noise.setBlockSize(Chunk.chunkSize.x * this.blockSize, Chunk.chunkSize.y * this.blockSize, Chunk.chunkSize.z * this.blockSize);
        }*/
    }

    async loadEnvironment(worldtype?: number): Promise<void> {
        // worldtype should be 1 for flat world, 2 for normal world
        worldtype = worldtype || 1; // default to flat world

        this.voxelEngine.worldType = worldtype == 2 ? { type: "normal" } : {
            type: "flat",
            map: ["bedrock", "dirt", "dirt", "grass_block"]
        };

        Block.generateTextureAtlas(this.scene);
        this.loadTerrain();
    }

    setupLight(): void {
        // sun light
        const light = new DirectionalLight("Sun", new Vector3(0, -1, 0), this.scene);
        light.intensity = 0.5;
        light.shadowEnabled = true;
        light.diffuse = new Color3(1, 0.95, 0.8);

        /*
        // moon light
        const moonLight = new DirectionalLight("moonLight", new Vector3(0, 1, 0), this.scene);
        moonLight.intensity = 0.5;
        moonLight.diffuse = new Color3(0.8, 0.8, 1);
        moonLight.shadowEnabled = true;
        moonLight.diffuse = new Color3(0.8, 0.8, 1);*/

        /*
        let light: DirectionalLight;
        [Vector3.Right(), Vector3.Left(), Vector3.Up(), Vector3.Down(), Vector3.Forward(), Vector3.Backward()].forEach((dir, i) => {
            light = new DirectionalLight("light" + i, dir, this.scene);
            light.intensity = 0.1;
            light.diffuse = new Color3(1, 1, 1);
            light.shadowEnabled = false;
            light.diffuse = new Color3(1, 1, 1);
        });*/
    }

    updateSky(): void {
        this.updateSkyColor();
        this.skybox.rotation.z = this.tick / this.maxTick * 2 * Math.PI;
        this.skybox.position = this.player.position;
        // light direction according to the sun position
        const sunDirection = new Vector3(Math.sin(this.skybox.rotation.z), Math.cos(this.skybox.rotation.z), 0);
        //(this.scene.lights[1] as DirectionalLight).direction = new Vector3(Math.sin(this.skybox.rotation.z + Math.PI), Math.cos(this.skybox.rotation.z + Math.PI), 0);
        // this.setLightDirection(sunDirection);
    }

    beforeRenderUpdate(): void {
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
        this.tick = this._tick + deltaTime * 20; //bypass math.floor to keep accuracy
        if (this._tick > this.maxTick) {
            this.tick = this._tick - this.maxTick;
            this.day++;
        }
        this.updateSky();
    }

    afterRenderUpdate(): void {
        //get the player position to know which chunks to load
        this.voxelEngine.loadChunkwithinRenderDistance(this.player.position);
    }

    public async load(worldtype?: number): Promise<void> {
        this.setupLight();
        this.setupSkybox();
        await this.loadEnvironment(worldtype);
        this.player.position = new Vector3(0, this.voxelEngine.gethighestBlock(0, 0) + 2, 0); // + player height

        this.scene.onAfterRenderObservable.add(() => this.afterRenderUpdate());
    }
}
