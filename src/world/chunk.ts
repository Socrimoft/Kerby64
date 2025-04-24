import { Color3, DrawWrapper, Engine, Mesh, Nullable, StandardMaterial, Vector2, Vector3, VertexBuffer, WebGPUEngine } from "@babylonjs/core";
import { Block, blockList, BlockType, blockTypeList, notaBlockList } from "./block";
import { LevelScene } from "../scenes/levelScene";
import { ChunkCompute } from "../compute_shaders/chunk/chunkCompute";
import { ToonMaterial } from "../materials/toonMaterial";

export class Chunk extends Mesh {
    static readonly chunkSize = new Vector3(16, 16, 16);
    static readonly blockCount = this.chunkSize.x * this.chunkSize.y * this.chunkSize.z;
    public blocks = new Uint32Array(Chunk.blockCount);

    private static _debugChunk: Nullable<Chunk> = null;

    public computeShader: ChunkCompute;

    constructor(private coord: Vector2, public scene: LevelScene) {
        super(`${coord.x},${coord.y}`, scene);

        this.position = new Vector3(coord.x * Chunk.chunkSize.x, 0, coord.y * Chunk.chunkSize.z);
        // for (let x = 0; x < Chunk.chunkSize.x; x++) {
        //     for (let y = 0; y < Chunk.chunkSize.y; y++) {
        //         this.setBlock(new Vector3(x, y, 0), BlockType.grass_block);
        //     }
        // }

        this.computeShader = new ChunkCompute(scene.getEngine() as WebGPUEngine, Chunk.chunkSize);

        this.setVerticesBuffer(new VertexBuffer(this.scene.getEngine(), this.computeShader.vertexBuffer.getBuffer(), VertexBuffer.PositionKind, true, false, 48, false, 0, 3, VertexBuffer.FLOAT, false, true));
        this.setVerticesBuffer(new VertexBuffer(this.scene.getEngine(), this.computeShader.vertexBuffer.getBuffer(), VertexBuffer.NormalKind, true, false, 48, false, 16, 3, VertexBuffer.FLOAT, false, true));
        this.setVerticesBuffer(new VertexBuffer(this.scene.getEngine(), this.computeShader.vertexBuffer.getBuffer(), VertexBuffer.UVKind, true, false, 48, false, 32, 2, VertexBuffer.FLOAT, false, true));

        this.material = new ToonMaterial(`${this.name}_mat`, Block.getTextureAtlas(), this.scene);
        this.material.backFaceCulling = false;

        // cause flickering
        // this.occlusionType = Mesh.OCCLUSION_TYPE_OPTIMISTIC;
        // this.occlusionQueryAlgorithmType = Mesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
    }

    public getBlockIndex(position: Vector3) {
        return position.x + position.y * Chunk.chunkSize.x + position.z * Chunk.chunkSize.x * Chunk.chunkSize.y;
    }

    public getBlockCoords(index: number): Vector3 {
        const xSize = Chunk.chunkSize.x;
        const ySize = Chunk.chunkSize.y;

        const z = Math.floor(index / (xSize * ySize));
        const y = Math.floor((index % (xSize * ySize)) / xSize);
        const x = index % xSize;

        return new Vector3(x, y, z);
    }

    public getBlock(position: Vector3): number {
        return this.blocks[this.getBlockIndex(position)];
    }

    public setBlock(position: Vector3, type: number): void {
        // Set a block to the chunk at the given position
        // The position should be in chunk coordinates
        const x = position.x;
        const y = position.y;
        const z = position.z;

        // Check if the position is within the chunk bounds
        if (x < 0 || x >= Chunk.chunkSize.x || y < 0 || y >= Chunk.chunkSize.y || z < 0 || z >= Chunk.chunkSize.z) {
            throw new Error(`Position ${position} is out of chunk bounds`);
        }
        this.blocks[this.getBlockIndex(position)] = type;
    }

    public popBlock(position: Vector3): number | null {
        const block = this.getBlock(position);
        if (block) {
            this.setBlock(position, 0);
            return block;
        }
        return null;
    }

    // static async debugChunk(scene: LevelScene): Promise<Chunk> {
    //     if (!Chunk._debugChunk) {
    //         Chunk._debugChunk = new Chunk(new Vector2(0, 0), scene);
    //         let currentBlockTypeIndex = 0;
    //         let currentNotBlockTypeIndex = 0;
    //         for (let x = 0; x < Chunk.chunkSize.x; x++) {
    //             for (let z = 0; z < Chunk.chunkSize.z; z++) {
    //                 Chunk._debugChunk.addBlock(new Vector3(x, 1, z), blockTypeList[0]);
    //             }
    //         }

    //         for (let y = 3; y < Chunk.chunkSize.y; y = y + 3) {
    //             for (let x = 0; x < Chunk.chunkSize.x; x = x + 3) {
    //                 for (let z = 0; z < Chunk.chunkSize.z; z = z + 3) {
    //                     if (currentBlockTypeIndex < blockTypeList.length) {
    //                         Chunk._debugChunk.addBlock(new Vector3(x, y, z), blockTypeList[currentBlockTypeIndex]);
    //                         currentBlockTypeIndex++;

    //                     }
    //                 }
    //             }
    //         }
    //         for (let x = 0; x < Chunk.chunkSize.x; x = x + 3) {
    //             for (let z = 0; z < Chunk.chunkSize.z; z = z + 3) {
    //                 if (currentNotBlockTypeIndex < notaBlockList.length) {
    //                     Chunk._debugChunk.addBlock(new Vector3(x, 4, z), notaBlockList[currentNotBlockTypeIndex]);
    //                     currentNotBlockTypeIndex++;
    //                 }
    //             }
    //         }
    //     };
    //     Chunk._debugChunk.addBlock(new Vector3(0, 5, 0), "grass_block");
    //     await Chunk._debugChunk.populateMesh();
    //     return Chunk._debugChunk;
    // }

    getHighestBlock(x: number, z: number): number {
        let y = Chunk.chunkSize.y - 1;
        while (y > 0 && this.getBlock(new Vector3(x, y, z))) {
            y--;
        }
        return y;
    }

    public get3DChunkCoord(): Vector3 {
        return this.position;
    }

    public populate(worldtype?: { type: "flat", map: BlockType[] } | { type: "normal", noise: "SimplexPerlin3DBlock" }): Promise<void> {
        return new Promise((resolve) => {
            // Load a flat world in the chunk
            if (!worldtype)
                throw new Error("World type is not defined");
            if (worldtype.type === "flat") {
                const map = worldtype.map;
                const yMax = Math.min(map.length, Chunk.chunkSize.y);
                for (let x = 0; x < Chunk.chunkSize.x; x++) {
                    for (let z = 0; z < Chunk.chunkSize.z; z++) {
                        for (let y = 0; y < yMax; y++) {
                            this.setBlock(new Vector3(x, y, z), BlockType[map[y]]);
                        }
                    }
                }
            } else {
                throw new Error("World type is not supported");
            }

            this.computeShader.waitForReady().then(() => {
                // update geometry
                this.computeShader.updateGeometry(this.blocks);

                const webGpuEngine: WebGPUEngine = this.scene.getEngine() as WebGPUEngine;

                webGpuEngine._device.queue.onSubmittedWorkDone().then(() => {
                    const counterData: Uint32Array = new Uint32Array(1);
                    webGpuEngine.readFromStorageBuffer(this.computeShader.counterBuffer.getBuffer(), 0, 4, counterData, true).then(() => {
                        const totalVertices = counterData[0] * 4; // faceCount * vertices
                        const totalIndexes = counterData[0] * 2 * 3; // faceCount * fragments * vertices

                        // debug
                        this.computeShader.vertexBuffer.read().then((data) => {
                            const floatArray = new Float32Array(data.buffer);
                            console.log(floatArray);
                        });
                        this.computeShader.indexBuffer.read().then((data) => {
                            const uintArray = new Uint32Array(data.buffer);
                            console.log(uintArray);
                        });

                        this.setIndexBuffer(this.computeShader.indexBuffer.getBuffer(), totalVertices, totalIndexes, true);

                        this.refreshBoundingInfo();

                        resolve();
                    });
                });
            });
        });
    }
}
