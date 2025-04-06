import { Color3, Color4, DirectionalLight, Mesh, MeshBuilder, Texture, Vector2, Vector3, VertexBuffer } from "@babylonjs/core";
import { Environment } from "../environment";
import { Player } from "../../actors/player";
import { LevelScene } from "../../scenes/levelScene";
import { ToonMaterial } from "../../materials/toonMaterial";
import { Block, BlockType } from "../../world/block";
import { Chunk } from "../../world/chunk";

export class World extends Environment {
    private readonly blockSize: number = Block.size;
    private readonly dayDuration = 1200000; //20min in ms
    private readonly maxTick = 24000; // 24h in ticks
    protected readonly skyboxSize = 10; // in blocks
    private _tick = 0; //used to set skycolor
    public static readonly renderDistance = 2; // in blocks
    private day = 0;
    private WorldType?: { type: "flat", map: BlockType[] } | { type: "normal", noise: "SimplexPerlin3DBlock" };
    private chunksBuffer: Record<string, Chunk> = {}; // 2D array of chunks
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

    constructor(scene: LevelScene, player: Player, seed?: number) {
        super(scene, player, seed);
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

        const sun = MeshBuilder.CreatePlane("sun", { size: World.renderDistance * this.skyboxSize }, this.scene);
        const sunTexture = new Texture("./assets/images/world/skybox/sun.png", this.scene, undefined, undefined, Texture.NEAREST_SAMPLINGMODE);
        sunTexture.hasAlpha = true;
        sun.material = new ToonMaterial("sunMaterial", sunTexture, this.scene);
        sun.setParent(this.skybox);
        sun.position = new Vector3(World.renderDistance * Chunk.chunkSize.x, 0, 0);
        sun.rotation.y = -Math.PI / 2;

        const moon = MeshBuilder.CreatePlane("moon", { size: World.renderDistance * this.skyboxSize }, this.scene);
        const moonTexture = new Texture("./assets/images/world/skybox/sun.png", this.scene, undefined, undefined, Texture.NEAREST_SAMPLINGMODE);
        moonTexture.hasAlpha = true;
        moon.material = new ToonMaterial("moonMaterial", moonTexture, this.scene);
        moon.setParent(this.skybox);
        moon.position = new Vector3(-World.renderDistance * Chunk.chunkSize.x, 0, 0);
        moon.rotation.y = Math.PI / 2;
    }

    async loadTerrain(): Promise<void> {
        console.log("loadTerrain");
        this.scene.getEngine().hideLoadingUI();
        if (this.WorldType?.type === "flat") {
            let promises = await this.loadChunkwithinRenderDistance();

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
        console.log("loadEnvironment", worldtype);
        if (this.seed == 0) {
            await this.loadDebugEnvironment();
            return;
        }
        worldtype = worldtype || 0;
        this.WorldType = worldtype > 1 ? { type: "normal", noise: "SimplexPerlin3DBlock" } : {
            type: "flat",
            map: ["bedrock", "dirt"]
        };
        await this.loadTerrain();
    }
    async loadDebugEnvironment() {
        Chunk.debugChunk(this.scene);
    }

    setupLight(): void {
        // sun light
        this.light = new DirectionalLight("Sun", new Vector3(0, -1, 0), this.scene);
        this.light.intensity = 0.5;
        this.light.shadowEnabled = true;
        this.light.diffuse = new Color3(1, 0.95, 0.8);

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

    getLightDirection(): Vector3 {
        return this.light ? this.light.direction.normalize() : Vector3.Zero();
    }

    setLightDirection(direction: Vector3): void {
        if (this.light)
            this.light.direction = direction;
    }
    updateSky(): void {
        this.updateSkyColor();
        this.skybox.rotation.z = this.tick / this.maxTick * 2 * Math.PI;
        this.skybox.position = this.player.position;
        // light direction according to the sun position
        const sunDirection = new Vector3(Math.sin(this.skybox.rotation.z), Math.cos(this.skybox.rotation.z), 0);
        //(this.scene.lights[1] as DirectionalLight).direction = new Vector3(Math.sin(this.skybox.rotation.z + Math.PI), Math.cos(this.skybox.rotation.z + Math.PI), 0);
        this.setLightDirection(sunDirection);
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
        console.log("afterRenderUpdate", this.player.position);
        this.loadChunkwithinRenderDistance();

    }
    async loadChunkwithinRenderDistance(): Promise<Promise<Vector2>[]> {
        const playerPosition = this.player.position;
        const playerChunkX = Math.floor(playerPosition.x / this.blockSize);
        const playerChunkZ = Math.floor(playerPosition.z / this.blockSize);
        let promises: Promise<Vector2>[] = [];
        //load the chunks around the player
        for (let x = playerChunkX - World.renderDistance; x <= playerChunkX + World.renderDistance; x++) {
            for (let z = playerChunkZ - World.renderDistance; z <= playerChunkZ + World.renderDistance; z++) {
                const chunkKey = `${x}_${z}`;
                if (!this.chunksBuffer[chunkKey]) {
                    this.chunksBuffer[chunkKey] = new Chunk(new Vector2(x, z), this.scene);
                    this.chunksBuffer[chunkKey].populate(this.WorldType);
                    promises.push(this.chunksBuffer[chunkKey].populateMesh());
                }
            }
        }
        return promises;
    }
    public gethighestBlock(x: number, z: number): number {
        const chunkX = Math.floor(x / this.blockSize);
        const chunkZ = Math.floor(z / this.blockSize);
        const chunkKey = `${chunkX}_${chunkZ}`;
        if (this.chunksBuffer[chunkKey]) {
            return this.chunksBuffer[chunkKey].getHighestBlock(x, z);
        }
        return 0;
    }


    public async load(worldtype?: number): Promise<void> {
        this.setupLight();
        this.setupSkybox();
        await this.loadEnvironment(worldtype);
        console.log("load", this.gethighestBlock(0, 0));
        this.player.position = new Vector3(0, this.gethighestBlock(0, 0), 0);
        [VertexBuffer.PositionKind,
        VertexBuffer.NormalKind,
        VertexBuffer.UVKind,
        VertexBuffer.UV2Kind,
        VertexBuffer.UV3Kind,
        VertexBuffer.UV4Kind,
        VertexBuffer.UV5Kind,
        VertexBuffer.UV6Kind,
        VertexBuffer.ColorKind,
        VertexBuffer.MatricesIndicesKind,
        VertexBuffer.MatricesIndicesExtraKind,
        VertexBuffer.MatricesWeightsKind,
        VertexBuffer.MatricesWeightsExtraKind].forEach((kind) => {
            console.log(kind, Block.runtimeMeshBuffer["oak_leaves"]?.getVertexBuffer(kind));
        })
    }
}
