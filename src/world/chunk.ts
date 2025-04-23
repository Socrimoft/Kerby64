import { Mesh, Nullable, Vector2, Vector3 } from "@babylonjs/core";
import { Block, blockList, blocks, BlockType, blockTypeList, notaBlockList } from "./block";
import { LevelScene } from "../scenes/levelScene";

export class Chunk extends Mesh {
    static readonly chunkSize = new Vector3(16, 256, 16);
    private static _debugChunk: Nullable<Chunk> = null;
    public blocks: Nullable<Block>[][][];
    private readonly _ChunkCoord: Vector3;
    constructor(private coord: Vector2, public scene: LevelScene) {
        super(`${coord.x},${coord.y}`, scene);
        this.blocks = [];
        this._ChunkCoord = new Vector3(coord.x * Chunk.chunkSize.x, 0, coord.y * Chunk.chunkSize.z);
        for (let x = 0; x < Chunk.chunkSize.x; x++) {
            this.blocks[x] = [];
            for (let y = 0; y < Chunk.chunkSize.y; y++) {
                this.blocks[x][y] = [];
                for (let z = 0; z < Chunk.chunkSize.z; z++) {
                    this.blocks[x][y][z] = null;
                }
            }
        }
        this.occlusionType = Mesh.OCCLUSION_TYPE_OPTIMISTIC;
        this.occlusionQueryAlgorithmType = Mesh.OCCLUSION_ALGORITHM_TYPE_CONSERVATIVE;
    }

    static async debugChunk(scene: LevelScene): Promise<Chunk> {
        if (!Chunk._debugChunk) {
            Chunk._debugChunk = new Chunk(new Vector2(0, 0), scene);
            let currentBlockTypeIndex = 0;
            let currentNotBlockTypeIndex = 0;
            for (let x = 0; x < Chunk.chunkSize.x; x++) {
                for (let z = 0; z < Chunk.chunkSize.z; z++) {
                    Chunk._debugChunk.addBlock(new Vector3(x, 1, z), blockTypeList[0]);
                }
            }

            for (let y = 3; y < Chunk.chunkSize.y; y = y + 3) {
                for (let x = 0; x < Chunk.chunkSize.x; x = x + 3) {
                    for (let z = 0; z < Chunk.chunkSize.z; z = z + 3) {
                        if (currentBlockTypeIndex < blockTypeList.length) {
                            Chunk._debugChunk.addBlock(new Vector3(x, y, z), blockTypeList[currentBlockTypeIndex]);
                            currentBlockTypeIndex++;

                        }
                    }
                }
            }
            for (let x = 0; x < Chunk.chunkSize.x; x = x + 3) {
                for (let z = 0; z < Chunk.chunkSize.z; z = z + 3) {
                    if (currentNotBlockTypeIndex < notaBlockList.length) {
                        Chunk._debugChunk.addBlock(new Vector3(x, 4, z), notaBlockList[currentNotBlockTypeIndex]);
                        currentNotBlockTypeIndex++;
                    }
                }
            }
        };
        Chunk._debugChunk.addBlock(new Vector3(0, 5, 0), "grass_block");
        await Chunk._debugChunk.populateMesh();
        return Chunk._debugChunk;
    }

    getHighestBlock(x: number, z: number): number {
        let y = Chunk.chunkSize.y - 1;
        while (y > 0 && !this.blocks[x][y][z]) {
            y--;
        }
        return y;
    }

    public addBlock(position: Vector3, type: BlockType) {
        // Add a block to the chunk at the given position
        // The position should be in chunk coordinates
        const x = Math.floor(position.x);
        const y = Math.floor(position.y);
        const z = Math.floor(position.z);

        // Check if the position is within the chunk bounds
        if (x < 0 || x >= Chunk.chunkSize.x || y < 0 || y >= Chunk.chunkSize.y || z < 0 || z >= Chunk.chunkSize.z) {
            throw new Error(`Position ${position} is out of chunk bounds`);
        }
        this.blocks[x][y][z] = new Block(position.addInPlace(this.get3DChunkCoord()), this, type);
    }
    public popBlock(position: Vector3): Nullable<Block> {
        const block = this.blocks[position.x][position.y][position.z];
        if (block) {
            //TODO: Remove the block from the chunk's mesh


            this.blocks[position.x][position.y][position.z] = null;
            return block;
        }
        return null;
    }

    public get3DChunkCoord(): Vector3 {
        return this._ChunkCoord;
    }

    public populate(worldtype?: { type: "flat", map: BlockType[] } | { type: "normal", noise: "SimplexPerlin3DBlock" }): void {
        // Load a flat world in the chunk
        if (!worldtype)
            throw new Error("World type is not defined");
        if (worldtype.type === "flat") {
            const map = worldtype.map;
            const yMax = Math.min(map.length, Chunk.chunkSize.y);
            for (let x = 0; x < Chunk.chunkSize.x; x++) {
                for (let z = 0; z < Chunk.chunkSize.z; z++) {
                    for (let y = 0; y < yMax; y++) {
                        this.addBlock(new Vector3(x, y, z), map[y]);
                    }
                }
            }
        } else {
            throw new Error("World type is not supported");
        }
    }

    public async populateMesh() {
        // Populate the blocks in the chunk asynchronously
        // Use Promise.allSettled to wait for all blocks to be populated
        // ignore errors
        // do not use .flat() on this.blocks (it is a 3D array)

        const promises: Promise<Block>[] = [];
        let block: Nullable<Block>;
        for (let x = 0; x < Chunk.chunkSize.x; x++) {
            for (let y = 0; y < Chunk.chunkSize.y; y++) {
                for (let z = 0; z < Chunk.chunkSize.z; z++) {
                    block = this.blocks[x][y][z];
                    if (block) {
                        //console.log(`populating ${x},${y},${z}`);
                        promises.push(block.populateMesh());
                    }
                }
            }
        }
        await Promise.allSettled(promises);
        return this.coord;
    }
    getBlock(vector3: Vector3): Nullable<Block> {
        return this.blocks[vector3.x][vector3.y][vector3.z];
    }
}