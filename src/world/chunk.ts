import { Nullable, TransformNode, Vector2, Vector3 } from "@babylonjs/core";
import { Block, BlockType } from "./block";
import { LevelScene } from "../scenes/levelScene";

export class Chunk extends TransformNode {
    static readonly chunkSize = new Vector3(16, 256, 16);
    private static _debugChunk: Nullable<Chunk> = null;
    private blocks: Nullable<Block>[][][];
    constructor(private coord: Vector2, public scene: LevelScene) {
        super(`${coord.x},${coord.y}`, scene);
        this.blocks = [];
        for (let x = 0; x < Chunk.chunkSize.x; x++) {
            this.blocks[x] = [];
            for (let y = 0; y < Chunk.chunkSize.y; y++) {
                this.blocks[x][y] = [];
                for (let z = 0; z < Chunk.chunkSize.z; z++) {
                    this.blocks[x][y][z] = null;
                }
            }
        }
    }
    static async debugChunk(scene: LevelScene): Promise<Chunk> {
        if (!Chunk._debugChunk) {
            Chunk._debugChunk = new Chunk(new Vector2(0, 0), scene);
            const blockTypeList = Object.keys(Block.blockList) as BlockType[];
            let currentBlockTypeIndex = 0;
            // Chunk._debugChunk.blocks[0][0][0] = new Block(new Vector3(0, 0, 0), Chunk._debugChunk, blockTypeList[currentBlockTypeIndex]);
            for (let x = 0; x < Chunk.chunkSize.x; x = x + 3) {
                for (let y = 0; y < Chunk.chunkSize.y; y = y + 3) {
                    for (let z = 0; z < Chunk.chunkSize.z; z = z + 3) {
                        Chunk._debugChunk.blocks[x][y][z] = new Block(new Vector3(x, y, z), Chunk._debugChunk, blockTypeList[currentBlockTypeIndex]);;
                        currentBlockTypeIndex++;
                        if (currentBlockTypeIndex >= blockTypeList.length) currentBlockTypeIndex = 0;
                    }
                }
            }
        };
        await Chunk._debugChunk.populate();
        return Chunk._debugChunk;
    }
    public async populate() {
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
}