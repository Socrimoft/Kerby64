import { TransformNode, Vector2, Vector3, WebGPUEngine } from "@babylonjs/core";
import { ChunkCompute } from "../compute_shaders/chunk/chunkCompute";
import { Chunk } from "./chunk";
import { Block, blockList } from "./block";
import { LevelScene } from "../scenes/levelScene";
import { ChunkGen } from "../compute_shaders/chunk/chunkGen";

export class VoxelEngine {
    private scene: LevelScene;

    private world: TransformNode;

    public readonly renderDistance = 12;
    private chunksBuffer: Record<string, Chunk> = {};

    private activeJobs = 0;
    private readonly MAX_PARALLEL_JOBS = 1;
    private chunkGenerationQueue: Array<Chunk> = [];

    private chunkCompute: ChunkCompute;
    private chunkGen: ChunkGen;

    private lastPlayerChunkPosition?: Vector2;

    constructor(scene: LevelScene, seed: number) {
        this.scene = scene;
        this.chunkCompute = new ChunkCompute(scene.getEngine() as WebGPUEngine);
        this.chunkGen = new ChunkGen(scene.getEngine() as WebGPUEngine, seed);

        this.world = new TransformNode("world", scene);
    }
    set worldType(worldtype: { type: "flat"; map: (keyof typeof blockList)[] } | { type: "normal" }) {
        this.chunkGen.worldType = worldtype;
    }
    public get worldType() {
        return this.chunkGen.worldType as any;
    }
    private enqueueChunk(chunk: Chunk) {
        this.chunkGenerationQueue.push(chunk);
        this.processChunkQueue();
    }

    private processChunkQueue() {
        if (this.activeJobs >= this.MAX_PARALLEL_JOBS || this.chunkGenerationQueue.length === 0)
            return;

        const nextChunk = this.chunkGenerationQueue.shift();
        if (!nextChunk) return;

        this.activeJobs++;
        this.populateChunk(nextChunk).then(() => {
            this.activeJobs--;
            this.processChunkQueue();
        });

        this.processChunkQueue(); // ??
    }

    public loadChunkwithinRenderDistance(playerPosition: Vector3) {
        const playerChunkX = Math.floor(playerPosition.x / Chunk.chunkSize.x);
        const playerChunkZ = Math.floor(playerPosition.z / Chunk.chunkSize.z);

        if (this.lastPlayerChunkPosition && this.lastPlayerChunkPosition.x == playerChunkX && this.lastPlayerChunkPosition.y == playerChunkZ)
            return; // no need to update if the player is in the same chunk as before

        // the player has moved to a new chunk
        // calculate the new chunk coordinates
        this.lastPlayerChunkPosition = new Vector2(playerChunkX, playerChunkZ);

        const visibleKeys = new Set<string>();
        let currentchunkX = playerChunkX;
        let currentchunkZ = playerChunkZ;
        visibleKeys.add(`${currentchunkX}_${currentchunkZ}`);
        for (let i = 1; i <= this.renderDistance; i++) {
            visibleKeys.add(`${--currentchunkX}_${currentchunkZ}`);
            for (let j = 1; j <= 2 * (i - 1) + 1; j++) {
                visibleKeys.add(`${currentchunkX}_${++currentchunkZ}`);
            }
            for (let j = 1; j <= 2 * i; j++) {
                visibleKeys.add(`${++currentchunkX}_${currentchunkZ}`);
            }
            for (let j = 1; j <= 2 * i; j++) {
                visibleKeys.add(`${currentchunkX}_${--currentchunkZ}`);
            }
            for (let j = 1; j <= 2 * i; j++) {
                visibleKeys.add(`${--currentchunkX}_${currentchunkZ}`);
            }
        }

        // remove chunks that are not visible anymore
        for (const key of Object.keys(this.chunksBuffer)) {
            if (!visibleKeys.has(key)) {
                this.chunksBuffer[key].dispose();
                delete this.chunksBuffer[key];
            }
        }

        // compute the chunks that are not loaded yet
        for (const key of visibleKeys) {
            if (!this.chunksBuffer[key]) {
                const chunkCoord = VoxelEngine.keytoChunkPosition(key);
                const chunk = new Chunk(chunkCoord, this.scene);
                chunk.setParent(this.world);
                this.chunksBuffer[key] = chunk;
                this.enqueueChunk(chunk);
            }
        }
    }

    public static keytoChunkPosition(key: string): Vector2 {
        return new Vector2(...key.split("_", 2).map(Number));
    }

    private populateChunk(chunk: Chunk): Promise<void> {
        return new Promise((resolve) => {
            // generate the blocks' chunk using the compute shader
            this.chunkGen.generateChunk(chunk).then((blockBuffer) => {
                this.chunkCompute.waitForReady().then(() => {
                    // update geometry
                    this.chunkCompute.updateGeometry(blockBuffer);

                    const webGpuEngine: WebGPUEngine = this.scene.getEngine() as WebGPUEngine;

                    webGpuEngine._device.queue.onSubmittedWorkDone().then(() => {
                        const counterData: Uint32Array = new Uint32Array(1);
                        webGpuEngine.readFromStorageBuffer(this.chunkCompute.counterBuffer.getBuffer(), 0, 4, counterData, true).then(() => {
                            chunk.setupBuffers(counterData[0], this.chunkCompute.getVertexBuffer(), this.chunkCompute.getIndexBuffer());

                            chunk.refreshBoundingInfo();

                            resolve();
                        });
                    });
                });
            });


        });
    }

    public gethighestBlock(x: number, z: number): number {
        const chunkX = Math.floor(x / Block.size / Chunk.chunkSize.x);
        const chunkZ = Math.floor(z / Block.size / Chunk.chunkSize.z);
        const chunkKey = `${chunkX}_${chunkZ}`;
        if (this.chunksBuffer[chunkKey]) {
            return this.chunksBuffer[chunkKey].getHighestBlock(x - chunkX * Chunk.chunkSize.x, z - chunkZ * Chunk.chunkSize.z);
        }
        return 0;
    }
}
