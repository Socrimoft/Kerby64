import { Constants, StorageBuffer, UniformBuffer, WebGPUEngine } from "@babylonjs/core";
import { ComputeShader } from "@babylonjs/core/Compute/computeShader";
import chunkGenSource from "./chunkGen.wgsl";
import { Chunk } from "../../voxel/chunk";
import { BlockType } from "../../voxel/block";

export class ChunkGen extends ComputeShader {
    private seedBuffer: UniformBuffer;
    private dispatchParamsBuffer: StorageBuffer;
    private chunkCoordBuffer: UniformBuffer;
    constructor(private engine: WebGPUEngine, private seed: number) {
        super("chunkGen", engine, { computeSource: chunkGenSource }, {
            bindingsMapping: {
                "seed": { group: 0, binding: 0 },
                "chunkInfo": { group: 0, binding: 1 }, // chunkSize (x,y,z) + Worldtype (w)
                "chunkCoord": { group: 0, binding: 2 },
                "blockBuffer": { group: 0, binding: 3 },
            }
        });
        this.seedBuffer = new UniformBuffer(this.engine);
        this.seedBuffer.updateInt("seed", this.seed);
        this.setUniformBuffer("seed", this.seedBuffer);

        const chunkInfo = new UniformBuffer(this.engine);
        chunkInfo.updateUInt4("chunkInfo", Chunk.chunkSize.x, Chunk.chunkSize.y, Chunk.chunkSize.z,
            ["flat", "normal", "debug"].indexOf(Chunk.worldtype.type));
        this.setUniformBuffer("chunkInfo", this.seedBuffer);

        this.chunkCoordBuffer = new UniformBuffer(this.engine);
        this.setUniformBuffer("chunkCoord", this.chunkCoordBuffer);

        this.dispatchParamsBuffer = new StorageBuffer(this.engine, 3 * 4, Constants.BUFFER_CREATIONFLAG_INDIRECT | Constants.BUFFER_CREATIONFLAG_READWRITE);
        this.dispatchParamsBuffer.update(new Uint32Array([Chunk.chunkSize.x / 8, Chunk.chunkSize.y, Chunk.chunkSize.z / 8]));
    }
    async generateChunk(chunk: Chunk): Promise<StorageBuffer> {
        const blockBuffer = new StorageBuffer(this.engine, Chunk.blockCount * 2, Constants.BUFFER_CREATIONFLAG_READWRITE);
        blockBuffer.update(chunk.blocks);
        this.chunkCoordBuffer.updateInt2("chunkCoord", chunk.position.x, chunk.position.z);
        if (chunk.blocks[0] !== BlockType.bedrock) {
            console.log("dispatching chunkGen compute shader", chunk.position.x, chunk.position.z);
            this.setStorageBuffer("blockBuffer", blockBuffer);
            this.dispatchIndirect(this.dispatchParamsBuffer);
            blockBuffer.read().then((data) => { console.log("omg", data) });
        }
        return blockBuffer;
        // todo next, wait for this coputershader to finish and use this buffer as blocks buffer to compute chunk mesh
    }
    public waitForReady(): Promise<void> {
        return new Promise((resolve) => {
            if (this.isReady()) {
                resolve();
            }
            else {
                const checkReady = () => {
                    if (this.isReady()) {
                        this.engine.onEndFrameObservable.removeCallback(checkReady);
                        resolve();
                    }
                };
                this.engine.onEndFrameObservable.add(checkReady);
            }
        });
    }
}